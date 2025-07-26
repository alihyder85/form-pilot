package ca.alihyder.formpilot.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Represents the response sent back to the Chrome extension.
 * Contains a mapping of field identifiers to filled values.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FormResponse {
    private Map<String, ?> filledValues;
    private String message;
    private boolean success;
    
    public FormResponse(Map<String, ?> filledValues) {
        this.filledValues = filledValues;
        this.success = true;
        this.message = "Form fields filled successfully";
    }
    
    public static FormResponse error(String message) {
        FormResponse response = new FormResponse();
        response.setSuccess(false);
        response.setMessage(message);
        return response;
    }
}