/**
 * Smart Form Filler - Content Script
 * 
 * This script is injected into web pages to detect and fill form fields.
 * It gathers form field data and sends it to the background script.
 */

// Wait for the page to fully load
document.addEventListener('DOMContentLoaded', () => {
  console.log('Smart Form Filler: Content script loaded');

  // Load settings to check if auto-fill is enabled
  chrome.storage.sync.get('settings', result => {
    const settings = result.settings || { autoFillEnabled: true };

    if (settings.autoFillEnabled) {
      // Scan for forms after a short delay to ensure all dynamic content is loaded
      setTimeout(scanForForms, 1000);
    } else {
      console.log('Smart Form Filler: Auto-fill is disabled');
    }
  });
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received message:', message);

  if (message.action === 'scanAndFillForms') {
    scanForForms();
    sendResponse({ success: true, message: 'Scanning for forms' });
  } else if (message.action === 'clearForms') {
    clearForms();
    sendResponse({ success: true, message: 'Forms cleared' });
  }

  return true;
});

/**
 * Scan the page for forms and gather form field data
 */
function scanForForms() {
  const forms = document.querySelectorAll('form');

  if (forms.length === 0) {
    console.log('Smart Form Filler: No forms found on this page');
    // If no forms are found, look for individual form elements
    scanForFormFields();
    return;
  }

  console.log(`Smart Form Filler: Found ${forms.length} forms`);

  // Process each form
  forms.forEach((form, formIndex) => {
    const formFields = gatherFormFieldsData(form);

    if (formFields.length > 0) {
      // Send the form data to the background script
      const formData = {
        url: window.location.href,
        pageTitle: document.title,
        fields: formFields
      };

      console.log(`Smart Form Filler: Sending form ${formIndex + 1} data to background script`, formData);

      chrome.runtime.sendMessage({
        action: 'fillForm',
        formData: formData
      }, response => {
        if (response && response.success) {
          console.log('Smart Form Filler: Received filled values from server', response);
          fillFormFields(response.filledValues);
        } else {
          console.error('Smart Form Filler: Error filling form', response ? response.message : 'No response');
        }
      });
    }
  });
}

/**
 * Scan for individual form fields when no forms are found
 */
function scanForFormFields() {
  const inputElements = document.querySelectorAll('input, textarea, select');

  if (inputElements.length === 0) {
    console.log('Smart Form Filler: No form fields found on this page');
    return;
  }

  console.log(`Smart Form Filler: Found ${inputElements.length} form fields`);

  const formFields = Array.from(inputElements)
    .map(element => createFormFieldData(element))
    .filter(field => field !== null);

  if (formFields.length > 0) {
    // Send the form data to the background script
    const formData = {
      url: window.location.href,
      pageTitle: document.title,
      fields: formFields
    };

    console.log('Smart Form Filler: Sending form fields data to background script', formData);

    chrome.runtime.sendMessage({
      action: 'fillForm',
      formData: formData
    }, response => {
      if (response && response.success) {
        console.log('Smart Form Filler: Received filled values from server', response);
        fillFormFields(response.filledValues);
      } else {
        console.error('Smart Form Filler: Error filling form', response ? response.message : 'No response');
      }
    });
  }
}

/**
 * Gather data for all fields in a form
 * 
 * @param {HTMLFormElement} form - The form element to gather data from
 * @returns {Array} - Array of form field data objects
 */
function gatherFormFieldsData(form) {
  const formElements = form.querySelectorAll('input, textarea, select');

  return Array.from(formElements)
    .map(element => createFormFieldData(element))
    .filter(field => field !== null);
}

/**
 * Create a form field data object from a form element
 * 
 * @param {HTMLElement} element - The form element to create data from
 * @returns {Object|null} - Form field data object or null if element should be skipped
 */
function createFormFieldData(element) {
  // Skip hidden, submit, button, and already filled elements
  if (
    element.type === 'hidden' || 
    element.type === 'submit' || 
    element.type === 'button' || 
    element.type === 'file' ||
    (element.value && element.value.trim() !== '')
  ) {
    return null;
  }

  // Get the label for the element
  let label = '';

  // Check for label with 'for' attribute
  if (element.id) {
    const labelElement = document.querySelector(`label[for="${element.id}"]`);
    if (labelElement) {
      label = labelElement.textContent.trim();
    }
  }

  // If no label found, check for parent label
  if (!label && element.closest('label')) {
    label = element.closest('label').textContent.trim();
    // Remove the element's value from the label if present
    if (element.value) {
      label = label.replace(element.value, '').trim();
    }
  }

  // If still no label, look for preceding text
  if (!label) {
    // Look for text nodes or elements that might be labels
    const previousElement = element.previousElementSibling;
    if (previousElement && !previousElement.matches('input, textarea, select, button')) {
      label = previousElement.textContent.trim();
    }
  }

  // Collect options if the element is a select
  let selectOptions = [];
  if (element.tagName.toLowerCase() === 'select') {
    selectOptions = Array.from(element.options).map(opt => ({
      value: opt.value,
      text: opt.text
    }));
  }
  console.log('Smart Form Filler: Form field selectOptions :', selectOptions)

  return {
    id: element.id || '',
    name: element.name || '',
    type: element.type || element.tagName.toLowerCase(),
    label: label,
    placeholder: element.placeholder || '',
    required: element.required || false,
    value: element.value || '',
    options: selectOptions
  };
}

/**
 * Fill form fields with the provided values
 * 
 * @param {Object} filledValues - Map of field identifiers to values
 */
function fillFormFields(filledValues) {
  if (!filledValues) {
    console.error('Smart Form Filler: No filled values provided');
    return;
  }

  console.log('Smart Form Filler: Filling form fields with values', filledValues);

  // Process each field
  Object.entries(filledValues).forEach(([fieldId, value]) => {
    // Try to find the element by ID first, then by name
    let element = document.getElementById(fieldId);

    if (!element) {
      element = document.querySelector(`[name="${fieldId}"]`);
    }

    if (!element) {
      console.warn(`Smart Form Filler: Could not find element with ID or name "${fieldId}"`);
      return;
    }

    // Fill the field based on its type
    fillField(element, value);
  });
}

/**
 * Fill a specific field with a value
 * 
 * @param {HTMLElement} element - The element to fill
 * @param {string} value - The value to fill with
 */
function fillField(element, value) {
  const tagName = element.tagName.toLowerCase();

  if (tagName === 'select') {
    // For select elements, find the option with the matching value or text
    const options = Array.from(element.options);
    const option = options.find(opt => 
      opt.value === value || 
      opt.text.toLowerCase() === value.toLowerCase()
    );

    if (option) {
      element.value = option.value;
    } else {
      console.warn(`Smart Form Filler: Could not find option with value or text "${value}" for select element`);
    }
  } else if (element.type === 'checkbox' || element.type === 'radio') {
    // For checkboxes and radio buttons, check if value is truthy
    element.checked = value === 'true' || value === true;
  } else {
    // For text inputs, textareas, etc.
    element.value = value;
  }

  // Trigger events to notify the page of the change
  triggerEvents(element);
}

/**
 * Trigger events on an element to notify the page of changes
 * 
 * @param {HTMLElement} element - The element to trigger events on
 */
function triggerEvents(element) {
  // Create and dispatch events
  const events = ['input', 'change', 'blur'];

  events.forEach(eventType => {
    const event = new Event(eventType, { bubbles: true });
    element.dispatchEvent(event);
  });
}

/**
 * Clear all form fields on the page
 */
function clearForms() {
  console.log('Smart Form Filler: Clearing all form fields');

  // Find all input, textarea, and select elements
  const formElements = document.querySelectorAll('input, textarea, select');

  formElements.forEach(element => {
    // Skip buttons, submits, and hidden fields
    if (
      element.type === 'button' || 
      element.type === 'submit' || 
      element.type === 'reset' || 
      element.type === 'hidden' ||
      element.type === 'file'
    ) {
      return;
    }

    // Clear the field based on its type
    if (element.type === 'checkbox' || element.type === 'radio') {
      element.checked = false;
    } else if (element.tagName.toLowerCase() === 'select') {
      element.selectedIndex = 0;
    } else {
      element.value = '';
    }

    // Trigger events to notify the page of the change
    triggerEvents(element);
  });

  console.log('Smart Form Filler: All form fields cleared');
}
