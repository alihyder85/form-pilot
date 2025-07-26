/**
 * Smart Form Filler - Popup Script
 * 
 * This script handles the functionality of the extension popup.
 */

// DOM elements
const serverStatusEl = document.getElementById('serverStatus');
const fillFormsBtn = document.getElementById('fillFormsBtn');
const clearFormsBtn = document.getElementById('clearFormsBtn');
const autoFillEnabledCheckbox = document.getElementById('autoFillEnabled');
const confirmBeforeFillCheckbox = document.getElementById('confirmBeforeFill');

// Server URL for health check
const SERVER_HEALTH_URL = 'http://localhost:8080/api/form/health';

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup script loaded');
  
  // Load saved settings
  loadSettings();
  
  // Check server status
  checkServerStatus();
  
  // Add event listeners
  fillFormsBtn.addEventListener('click', fillForms);
  clearFormsBtn.addEventListener('click', clearForms);
  autoFillEnabledCheckbox.addEventListener('change', saveSettings);
  confirmBeforeFillCheckbox.addEventListener('change', saveSettings);
});

/**
 * Check if the local server is running
 */
async function checkServerStatus() {
  try {
    const response = await fetch(SERVER_HEALTH_URL);
    
    if (response.ok) {
      serverStatusEl.textContent = 'Server is running';
      serverStatusEl.className = 'status success';
      
      // Enable buttons
      fillFormsBtn.disabled = false;
      clearFormsBtn.disabled = false;
    } else {
      serverStatusEl.textContent = `Server error: ${response.status}`;
      serverStatusEl.className = 'status error';
    }
  } catch (error) {
    console.error('Server health check failed:', error);
    serverStatusEl.textContent = 'Server is not running';
    serverStatusEl.className = 'status error';
  }
}

/**
 * Fill forms on the current page
 */
function fillForms() {
  // Get the current active tab
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs.length === 0) {
      console.error('No active tab found');
      return;
    }
    
    const activeTab = tabs[0];
    
    // If confirmation is required, ask the user
    if (confirmBeforeFillCheckbox.checked) {
      if (!confirm('Do you want to fill the forms on this page?')) {
        return;
      }
    }
    
    // Send message to content script to scan and fill forms
    chrome.tabs.sendMessage(activeTab.id, { action: 'scanAndFillForms' }, response => {
      if (chrome.runtime.lastError) {
        console.error('Error sending message to content script:', chrome.runtime.lastError);
      }
      
      console.log('Response from content script:', response);
    });
  });
}

/**
 * Clear forms on the current page
 */
function clearForms() {
  // Get the current active tab
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs.length === 0) {
      console.error('No active tab found');
      return;
    }
    
    const activeTab = tabs[0];
    
    // Send message to content script to clear forms
    chrome.tabs.sendMessage(activeTab.id, { action: 'clearForms' }, response => {
      if (chrome.runtime.lastError) {
        console.error('Error sending message to content script:', chrome.runtime.lastError);
      }
      
      console.log('Response from content script:', response);
    });
  });
}

/**
 * Save settings to Chrome storage
 */
function saveSettings() {
  const settings = {
    autoFillEnabled: autoFillEnabledCheckbox.checked,
    confirmBeforeFill: confirmBeforeFillCheckbox.checked
  };
  
  chrome.storage.sync.set({ settings }, () => {
    console.log('Settings saved:', settings);
  });
}

/**
 * Load settings from Chrome storage
 */
function loadSettings() {
  chrome.storage.sync.get('settings', result => {
    const settings = result.settings || {
      autoFillEnabled: true,
      confirmBeforeFill: true
    };
    
    autoFillEnabledCheckbox.checked = settings.autoFillEnabled;
    confirmBeforeFillCheckbox.checked = settings.confirmBeforeFill;
    
    console.log('Settings loaded:', settings);
  });
}