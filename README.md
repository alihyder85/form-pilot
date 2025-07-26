# Smart Form Filler

A Chrome extension that automatically identifies and fills out form fields on any webpage using a local Large Language Model.

## Project Structure

This project consists of two main components:

1. **Spring Boot Server**: A Java Spring Boot application that serves as the local LLM server.
2. **Chrome Extension**: A Chrome extension that detects forms on webpages and communicates with the local server.

## Prerequisites

- Java 17 or higher
- Gradle
- Google Chrome browser
- Basic knowledge of Spring Boot and Chrome extensions

## Getting Started

### Setting up the Spring Boot Server

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/FormPilot.git
   cd FormPilot
   ```

2. Build the Spring Boot application:
   ```bash
   ./gradlew build
   ```

3. Run the Spring Boot application:
   ```bash
   ./gradlew bootRun
   ```

   The server will start on port 8080. You can verify it's running by visiting:
   ```
   http://localhost:8080/api/form/health
   ```

### Setting up the Chrome Extension

1. Create icons for the extension as described in the [chrome-extension/README.md](chrome-extension/README.md) file.

2. Open Google Chrome and navigate to:
   ```
   chrome://extensions/
   ```

3. Enable "Developer mode" by toggling the switch in the top right corner.

4. Click "Load unpacked" and select the `chrome-extension` directory from this project.

5. The extension should now be installed and visible in your Chrome toolbar.

### Using the Demo Form

A demo form is included in this project to help you test the Smart Form Filler extension:

1. Open the demo form in your browser:
   ```
   file:///path/to/FormPilot/demo/demo-form.html
   ```
   Replace `path/to/FormPilot` with the actual path to your project directory.

2. Alternatively, you can serve the demo form using a simple HTTP server:
   ```bash
   # If you have Python installed
   cd FormPilot
   python -m http.server
   ```
   Then visit `http://localhost:8000/demo/demo-form.html` in your browser.

3. With the Smart Form Filler extension installed and the local server running, the extension should automatically detect the form fields on the demo page.

4. You can manually trigger form filling in two ways:
   - Click the extension icon in your Chrome toolbar
   - Right-click on the page and select "Smart Form Filler" from the context menu, then choose "Fill Forms"

The demo form includes various field types to demonstrate the capabilities of the Smart Form Filler extension:
- Personal information (name, email, password, phone, date)
- Address information (street, city, state, zip, country)
- Account preferences (occupation, income, contact method, interests)
- Additional information (comments, checkboxes)

## How It Works

### Spring Boot Server

The Spring Boot server exposes a REST API that accepts form field data and returns appropriate values for each field. The server uses a rule-based approach to generate values based on field names, types, and labels.

Key components:
- `FormField`: Model class representing a form field
- `FormData`: Model class representing a collection of form fields
- `FormResponse`: Model class representing the response with filled values
- `FormFillerService`: Service that generates values for form fields
- `FormFillerController`: REST controller that exposes the API endpoints

In a production environment, the server would integrate with a local LLM to generate more context-aware values.

### Chrome Extension

The Chrome extension injects a content script into every webpage that detects forms and form fields. It sends the form field data to the background script, which communicates with the local server. The server returns appropriate values for each field, and the content script fills the form fields with these values.

Key components:
- `manifest.json`: Configuration file for the extension
- `content.js`: Content script that detects forms and fills form fields
- `background.js`: Background script that communicates with the local server
- `popup.html` and `popup.js`: Popup UI for controlling the extension's behavior

## API Endpoints

### Fill Form Fields

```
POST /api/form/fill
```

Request body:
```json
{
  "url": "https://example.com/form",
  "pageTitle": "Example Form",
  "fields": [
    {
      "id": "email",
      "name": "email",
      "type": "email",
      "label": "Email Address",
      "placeholder": "Enter your email",
      "required": true,
      "value": ""
    },
    {
      "id": "password",
      "name": "password",
      "type": "password",
      "label": "Password",
      "placeholder": "Enter your password",
      "required": true,
      "value": ""
    }
  ]
}
```

Response:
```json
{
  "filledValues": {
    "email": "user@example.com",
    "password": "SecurePassword123!"
  },
  "message": "Form fields filled successfully",
  "success": true
}
```

### Health Check

```
GET /api/form/health
```

Response:
```
Form Filler Service is running
```

## Future Enhancements

1. **LLM Integration**: Integrate with a local LLM to generate more context-aware values.
2. **User Data Storage**: Allow users to save and load personal data for repeated use.
3. **Form Detection Improvements**: Enhance form detection to handle more complex forms.
4. **Security Enhancements**: Add authentication and encryption for communication between the extension and server.
5. **Custom Field Mappings**: Allow users to define custom mappings for specific websites.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
