# Smart Form Filler Chrome Extension

This Chrome extension automatically identifies and fills out form fields on any webpage using a local Large Language Model.

## Features

- Automatically detects forms and form fields on web pages
- Sends form field data to a local LLM server
- Fills form fields with appropriate values
- Provides a popup UI for controlling the extension's behavior

## Installation

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" by toggling the switch in the top right corner
4. Click "Load unpacked" and select the `chrome-extension` directory from this project
5. The extension should now be installed and visible in your Chrome toolbar

## Usage

1. Start the local LLM server (Spring Boot application)
2. Navigate to a webpage with a form
3. The extension will automatically detect and fill the form fields
4. You can also use the extension in the following ways:
   - Click the extension icon to open the popup and manually trigger form filling or clearing
   - Right-click on the page and select "Smart Form Filler" from the context menu, then choose "Fill Forms" or "Clear Forms"

## Configuration

You can configure the extension's behavior through the popup UI:

- **Auto-fill forms when page loads**: Automatically fill forms when a page loads
- **Confirm before filling forms**: Show a confirmation dialog before filling forms

## Server Integration

The extension communicates with a local server running on `localhost:8080`. Make sure the server is running before using the extension.
