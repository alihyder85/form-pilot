package ca.alihyder.formpilot.controller;

import ca.alihyder.formpilot.model.FormData;
import ca.alihyder.formpilot.model.FormResponse;
import ca.alihyder.formpilot.service.FormFillerService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for handling form filling requests from the Chrome extension.
 */
@Slf4j
@RestController
@RequestMapping("/api/form")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allow requests from Chrome extension
public class FormFillerController {

    private final FormFillerService formFillerService;

    /**
     * Endpoint for filling form fields.
     * 
     * @param formData The form data containing fields to fill
     * @return A response with filled values for each field
     */
    @PostMapping("/fill")
    public ResponseEntity<FormResponse> fillForm(HttpServletRequest request, @RequestBody FormData formData) {
        log.info("Received form fill request: {} fields", formData.getFields().size());

        try {
            String sessionId = request.getSession().getId();
            log.info("Session ID: {}", sessionId);

            FormResponse response = formFillerService.fillForm(sessionId, formData);
            log.info("Form filled successfully: {} fields", response.getFilledValues().size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error processing form: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(FormResponse.error("Error processing form: " + e.getMessage()));
        }
    }

    /**
     * Health check endpoint.
     * 
     * @return A simple message indicating the service is running
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Form Filler Service is running");
    }
}