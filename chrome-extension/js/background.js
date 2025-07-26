/**
 * Smart Form Filler - Background Service Worker
 * 
 * This script handles communication between the content script and the local server.
 * It receives form field data from the content script, sends it to the local server,
 * and returns the response to the content script.
 * It also creates and handles context menu items.
 */

// Server URL
const SERVER_URL = 'http://localhost:8080/api/form/fill';

// Create context menu items when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  // Create parent menu item
  chrome.contextMenus.create({
    id: 'smart-form-filler',
    title: 'Smart Form Filler',
    contexts: ['page', 'frame']
  });

  // Create child menu items
  chrome.contextMenus.create({
    id: 'fill-forms',
    parentId: 'smart-form-filler',
    title: 'Fill Forms',
    contexts: ['page', 'frame']
  });

  chrome.contextMenus.create({
    id: 'clear-forms',
    parentId: 'smart-form-filler',
    title: 'Clear Forms',
    contexts: ['page', 'frame']
  });

  console.log('Context menu items created');
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('Context menu item clicked:', info.menuItemId);

  if (info.menuItemId === 'fill-forms') {
    // Check if confirmation is required
    chrome.storage.sync.get('settings', result => {
      const settings = result.settings || { confirmBeforeFill: true };

      if (settings.confirmBeforeFill) {
        // We can't use confirm() in the background script, so we need to use chrome.tabs.executeScript
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: () => {
            return confirm('Do you want to fill the forms on this page?');
          }
        }).then(results => {
          if (results[0].result) {
            // User confirmed, send message to content script
            chrome.tabs.sendMessage(tab.id, { action: 'scanAndFillForms' });
          }
        });
      } else {
        // No confirmation required, send message to content script
        chrome.tabs.sendMessage(tab.id, { action: 'scanAndFillForms' });
      }
    });
  } else if (info.menuItemId === 'clear-forms') {
    // Send message to content script to clear forms
    chrome.tabs.sendMessage(tab.id, { action: 'clearForms' });
  }
});

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background script received message:', message);

  if (message.action === 'fillForm' && message.formData) {
    // Send the form data to the local server
    sendFormDataToServer(message.formData)
      .then(response => {
        console.log('Received response from server:', response);
        sendResponse(response);
      })
      .catch(error => {
        console.error('Error communicating with server:', error);
        sendResponse({
          success: false,
          message: `Error communicating with server: ${error.message}`
        });
      });

    // Return true to indicate that the response will be sent asynchronously
    return true;
  }
});

/**
 * Send form data to the local server
 * 
 * @param {Object} formData - The form data to send
 * @returns {Promise<Object>} - Promise resolving to the server response
 */
async function sendFormDataToServer(formData) {
  try {
    // Check server health first
    await checkServerHealth();

    // Send the form data to the server
    const response = await fetch(SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending form data to server:', error);
    throw error;
  }
}

/**
 * Check if the local server is running
 * 
 * @returns {Promise<void>} - Promise resolving if server is healthy
 */
async function checkServerHealth() {
  try {
    const response = await fetch('http://localhost:8080/api/form/health');

    if (!response.ok) {
      throw new Error(`Server health check failed: ${response.status}`);
    }

    console.log('Server is healthy');
  } catch (error) {
    console.error('Server health check failed:', error);
    throw new Error('Local server is not running. Please start the server and try again.');
  }
}

// Log when the background script is loaded
console.log('Smart Form Filler: Background script loaded');
