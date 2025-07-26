package ca.alihyder.formpilot.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Represents a collection of form fields from a webpage.
 * This is the main request object sent from the Chrome extension to the server.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FormData {
    private String url;
    private String pageTitle;
    private List<FormField> fields;
}