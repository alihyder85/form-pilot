package ca.alihyder.formpilot.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FormField {
    private String id;
    private String name;
    private String type;
    private String label;
    private String placeholder;
    private boolean required;
    private String value;
    private List<Option> options = new ArrayList<>();

    // Additional metadata for better field understanding
    private String autocomplete;
    private String pattern;
    private Integer minLength;
    private Integer maxLength;
    private String min;
    private String max;
}

@Data
class Option {
    private String text;
    private String value;
    private boolean selected;
}