package ca.alihyder.formpilot.service;

import ca.alihyder.formpilot.model.FormData;
import ca.alihyder.formpilot.model.FormField;
import ca.alihyder.formpilot.model.FormResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;


/**
 * Service responsible for generating values for form fields.
 * In a production environment, this would integrate with a local LLM.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FormFillerService {

    private final FormAssistant formAssistant;
    private final ObjectMapper objectMapper;// = new ObjectMapper();

    /**
     * Process form data and generate appropriate values for each field.
     * 
     * @param formData The form data containing fields to fill
     * @return A response with filled values for each field
     */
    @SneakyThrows
    public FormResponse fillForm(String sessionId, FormData formData) {
        if (formData == null || formData.getFields() == null || formData.getFields().isEmpty()) {
            return FormResponse.error("No form fields provided");
        }
        
        var filledValues = formAssistant.generateForm(sessionId, formData.getFields());

        return new FormResponse(filledValues);
    }
}