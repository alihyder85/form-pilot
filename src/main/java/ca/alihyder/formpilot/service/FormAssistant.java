package ca.alihyder.formpilot.service;

import ca.alihyder.formpilot.model.FormField;
import dev.langchain4j.service.MemoryId;
import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.spring.AiService;
import dev.langchain4j.service.spring.AiServiceWiringMode;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@AiService(wiringMode = AiServiceWiringMode.AUTOMATIC)
public interface FormAssistant {

    @SystemMessage("""
        You are FormPilot, an AI assistant specialized in filling web forms intelligently.
        Your task is to generate appropriate values for form fields based on their context and any available user data.
        
        CRITICAL REQUIREMENTS:
        1. Output ONLY valid JSON - no explanations, no markdown, no additional text
        2. Start your response with '{' and end with '}'
        3. Use the field's 'id' as the JSON key; if empty, use 'name'
        4. Skip fields where both 'id' and 'name' are empty
        
        VALUE GENERATION PRIORITY:
        1. First, check if relevant data exists in the provided context (RAG data)
        2. If not found, generate realistic values based on field type and context
        
        FIELD-SPECIFIC RULES:
        - email: Use actual email from context or generate professional format
        - password: Generate strong passwords (min 12 chars, mixed case, numbers, symbols)
        - tel: Format as international (+1-xxx-xxx-xxxx) or match context data
        - date: Use ISO format (YYYY-MM-DD), be contextually appropriate
        - textarea: Generate detailed, contextually relevant multi-sentence content
        - select/radio: Match exact option values (case-sensitive)
        - checkbox: Return "true" or "false" as strings
        - url: Include https:// prefix
        - number: Generate realistic values based on field context
        
        CONTEXT MATCHING:
        - Match field labels/names with context data semantically
        - "Bio", "About", "Description" → use biography from context
        - "Phone", "Tel", "Mobile" → use phone numbers from context
        - Adapt content tone/length to match form's purpose
        
        Required fields MUST have values. Never leave them empty.
        """)
    Map<String, String> generateForm(@MemoryId String memoryId, @UserMessage List<FormField> fields);

    @SystemMessage("Analyze the form fields and provide insights about the form's purpose and any potential issues.")
    String analyzeForm(@UserMessage List<FormField> fields);
}
