//! Script tag parsing.
//!
//! # Svelte Compiler Correspondence
//!
//! This module corresponds to:
//! - `svelte/packages/svelte/src/compiler/phases/1-parse/read/script.js`
//!
//! It provides script tag parsing for both instance (`<script>`) and module
//! (`<script context="module">` or `<script module>`) scripts.

use compact_str::CompactString;

use crate::ast::template::{
    AttributeValue, AttributeValuePart, Script, ScriptContext, ScriptType, TemplateNode, Text,
};
use crate::error::ParseResult;

use super::super::parser::Parser;

impl Parser<'_> {
    /// Merge attribute value parts into a single Text for script/style tags.
    /// This is needed because {curly braces} in quoted attribute values are NOT expressions.
    pub fn merge_attribute_parts_to_text(
        &self,
        parts: &[AttributeValuePart],
    ) -> Vec<AttributeValuePart> {
        if parts.len() <= 1 {
            // No merging needed
            return parts.to_vec();
        }

        // Find the overall range and merge the content
        let first_start = match parts.first() {
            Some(AttributeValuePart::Text(t)) => t.start,
            Some(AttributeValuePart::ExpressionTag(e)) => e.start,
            None => return vec![],
        };
        let last_end = match parts.last() {
            Some(AttributeValuePart::Text(t)) => t.end,
            Some(AttributeValuePart::ExpressionTag(e)) => e.end,
            None => return vec![],
        };

        // Get the raw content from the original source
        let raw = &self.source[first_start as usize..last_end as usize];

        vec![AttributeValuePart::Text(Text {
            start: first_start,
            end: last_end,
            raw: CompactString::from(raw),
            data: CompactString::from(raw),
        })]
    }

    /// Parse a <script> tag and store it in instance_script or module_script.
    pub fn parse_script_tag(
        &mut self,
        start: usize,
        attributes: Vec<crate::ast::Attribute>,
    ) -> ParseResult<Option<TemplateNode>> {
        let content_start = self.index;

        // Find the closing </script> tag (with optional whitespace before >)
        while !self.is_eof() && !self.is_valid_closing_tag("</script") {
            self.advance();
        }

        let content_end = self.index;
        let script_content = &self.source[content_start..content_end];

        // Consume </script followed by optional whitespace and >
        if self.match_str("</script") {
            self.advance_by(8); // consume '</script'
            // Skip whitespace before >
            while !self.is_eof() && self.current_char() != '>' {
                self.advance();
            }
            self.eat(">"); // consume '>'
        } else if self.is_eof() {
            // Script tag was not closed - check if there's actual content
            // If there's HTML content in the script, it's element_unclosed
            // If it's empty/only whitespace at EOF, it's unexpected_eof
            let has_html_content = script_content.contains('<') || script_content.contains('{');
            if has_html_content {
                return Err(crate::error::ParseError::svelte(
                    "element_unclosed",
                    "`<script>` was left open",
                    (self.index, self.index),
                ));
            } else {
                return Err(crate::error::ParseError::svelte(
                    "unexpected_eof",
                    "Unexpected end of input",
                    (self.index, self.index),
                ));
            }
        }

        let end = self.index;

        // Determine context and language from attributes
        let mut context = ScriptContext::Default;
        let mut is_typescript = false;
        let mut script_attributes = Vec::new();

        for attr in attributes {
            if let crate::ast::Attribute::Attribute(mut attr_node) = attr {
                // For script tags, merge expression parts back into text
                // because {curly braces} in quoted attribute values are NOT expressions
                if let AttributeValue::Sequence(ref parts) = attr_node.value {
                    let merged = self.merge_attribute_parts_to_text(parts);
                    attr_node.value = AttributeValue::Sequence(merged);
                }

                if attr_node.name.as_str() == "context" {
                    if let AttributeValue::Sequence(parts) = &attr_node.value
                        && let Some(AttributeValuePart::Text(t)) = parts.first()
                        && t.data.as_str() == "module"
                    {
                        context = ScriptContext::Module;
                    }
                } else if attr_node.name.as_str() == "module" {
                    // `module` attribute (boolean or with value) indicates module context
                    context = ScriptContext::Module;
                    script_attributes.push(attr_node);
                    continue;
                } else if attr_node.name.as_str() == "lang" {
                    if let AttributeValue::Sequence(parts) = &attr_node.value
                        && let Some(AttributeValuePart::Text(t)) = parts.first()
                    {
                        let lang = t.data.as_str();
                        if lang == "ts" || lang == "typescript" {
                            is_typescript = true;
                        }
                    }
                    script_attributes.push(attr_node);
                } else {
                    script_attributes.push(attr_node);
                }
            }
        }

        // Check for duplicate $props() calls (simple text-based check)
        // Count occurrences of "$props(" outside of comments and strings
        if context == ScriptContext::Default {
            let props_count = count_rune_calls(script_content, "$props(");
            if props_count > 1 {
                return Err(crate::error::ParseError::svelte(
                    "props_duplicate",
                    "Cannot use `$props()` more than once",
                    (content_start, content_start),
                ));
            }
        }

        // Check for $ prefix variables (reserved prefix)
        if let Some(pos) = find_dollar_prefix_declaration(script_content) {
            return Err(crate::error::ParseError::svelte(
                "dollar_prefix_invalid",
                "The $ prefix is reserved, and cannot be used for variables and imports",
                (content_start + pos, content_start + pos),
            ));
        }

        // Check for $ name (reserved name)
        if let Some(pos) = find_dollar_name_declaration(script_content) {
            return Err(crate::error::ParseError::svelte(
                "dollar_binding_invalid",
                "The $ name is reserved, and cannot be used for variables and imports",
                (content_start + pos, content_start + pos),
            ));
        }

        // Check for rune usage without parentheses (e.g., `= $props;` instead of `= $props()`)
        if context == ScriptContext::Default
            && let Some((_rune, pos)) = find_rune_without_parentheses(script_content)
        {
            return Err(crate::error::ParseError::svelte(
                "rune_missing_parentheses",
                "Cannot use rune without parentheses",
                (content_start + pos, content_start + pos),
            ));
        }

        // Check for legacy export let in runes mode
        if context == ScriptContext::Default {
            // Check if we're in runes mode (either via svelte:options or by using runes in script)
            let is_runes_mode = self.is_runes_mode() || uses_runes(script_content);
            if is_runes_mode {
                if let Some(pos) = find_export_let(script_content) {
                    return Err(crate::error::ParseError::svelte(
                        "legacy_export_invalid",
                        "Cannot use `export let` in runes mode — use `$props()` instead",
                        (content_start + pos, content_start + pos),
                    ));
                }

                // Check for beforeUpdate/afterUpdate import in runes mode
                if let Some((name, pos)) = find_invalid_runes_import(script_content) {
                    return Err(crate::error::ParseError::svelte(
                        "runes_mode_invalid_import",
                        format!("{} cannot be used in runes mode", name),
                        (content_start + pos, content_start + pos),
                    ));
                }
            }
        }

        // Check for $host() usage outside of custom element
        // (We can only do a simple check here - full validation requires knowing svelte:options)
        if context == ScriptContext::Default
            && let Some(pos) = find_host_call(script_content)
        {
            // For now, we always error on $host() - the svelte:options check
            // would need to be done in the analyze phase with access to options
            // But since we're in parse phase, we'll defer this to analyze phase
            // Actually, let's check if the parser has svelte_options set
            if !self.has_custom_element_option() {
                return Err(crate::error::ParseError::svelte(
                    "host_invalid_placement",
                    "`$host()` can only be used inside custom element component instances",
                    (content_start + pos, content_start + pos),
                ));
            }
        }

        // Check for $props() with arguments (not allowed)
        if context == ScriptContext::Default
            && let Some(pos) = find_props_with_arguments(script_content)
        {
            return Err(crate::error::ParseError::svelte(
                "rune_invalid_arguments",
                "`$props` cannot be called with arguments",
                (content_start + pos, content_start + pos),
            ));
        }

        // Check for $effect inside a return statement
        if context == ScriptContext::Default
            && let Some(pos) = find_effect_in_return(script_content)
        {
            return Err(crate::error::ParseError::svelte(
                "effect_invalid_placement",
                "`$effect` can only be used as an expression statement",
                (content_start + pos, content_start + pos),
            ));
        }

        // Check for $bindable outside of $props()
        if context == ScriptContext::Default
            && let Some(pos) = find_bindable_outside_props(script_content)
        {
            return Err(crate::error::ParseError::svelte(
                "bindable_invalid_location",
                "`$bindable()` can only be used inside a `$props()` declaration",
                (content_start + pos, content_start + pos),
            ));
        }

        // Check for rune argument count
        if context == ScriptContext::Default
            && let Some((rune, expected, pos)) = find_invalid_rune_arguments(script_content)
        {
            return Err(crate::error::ParseError::svelte(
                "rune_invalid_arguments_length",
                format!("`{}` must be called with {}", rune, expected),
                (content_start + pos, content_start + pos),
            ));
        }

        // Parse the script content as a JavaScript/TypeScript Program
        // Pass any pending leading comments (HTML comments before the script tag)
        let leading_comments = std::mem::take(&mut self.pending_leading_comments);
        let program = super::super::expression::parse_program(
            script_content,
            content_start,
            &self.line_offsets,
            is_typescript,
            &leading_comments,
        );

        let script = Script {
            node_type: ScriptType::Script,
            start: start as u32,
            end: end as u32,
            context,
            content: program,
            attributes: script_attributes,
        };

        match context {
            ScriptContext::Default => self.instance_script = Some(script),
            ScriptContext::Module => self.module_script = Some(script),
        }

        // Return None - script tags don't appear in the fragment
        Ok(None)
    }
}

/// Find a declaration with $ name (e.g., `let $`, `import { $ }`).
/// Returns the position of the $ character if found.
fn find_dollar_name_declaration(content: &str) -> Option<usize> {
    let chars: Vec<char> = content.chars().collect();
    let mut i = 0;

    while i < chars.len() {
        // Skip single-line comments
        if i + 1 < chars.len() && chars[i] == '/' && chars[i + 1] == '/' {
            while i < chars.len() && chars[i] != '\n' {
                i += 1;
            }
            continue;
        }

        // Skip block comments
        if i + 1 < chars.len() && chars[i] == '/' && chars[i + 1] == '*' {
            i += 2;
            while i + 1 < chars.len() && !(chars[i] == '*' && chars[i + 1] == '/') {
                i += 1;
            }
            i += 2;
            continue;
        }

        // Skip string literals
        if chars[i] == '"' || chars[i] == '\'' || chars[i] == '`' {
            let quote = chars[i];
            i += 1;
            while i < chars.len() {
                if chars[i] == '\\' && i + 1 < chars.len() {
                    i += 2;
                    continue;
                }
                if chars[i] == quote {
                    i += 1;
                    break;
                }
                i += 1;
            }
            continue;
        }

        // Check for patterns like "let $;", "let $,", "let $ ", "let $=", "{ $", "{ $ }", ", $", ", $ }"
        // These indicate using $ as a variable name
        if chars[i] == '$' && i + 1 < chars.len() {
            let next_char = chars[i + 1];
            // Check if $ is followed by non-identifier character (meaning $ is the whole name)
            if !next_char.is_alphanumeric() && next_char != '_' {
                // Check if this is after "let ", "const ", "var ", "{ ", or ", "
                if i >= 4 {
                    let prev: String = chars[i - 4..i].iter().collect();
                    if prev == "let " || prev == "var " {
                        return Some(i);
                    }
                }
                if i >= 6 {
                    let prev: String = chars[i - 6..i].iter().collect();
                    if prev == "const " {
                        return Some(i);
                    }
                }
                if i >= 2 {
                    let prev: String = chars[i - 2..i].iter().collect();
                    if prev == "{ " || prev == ", " {
                        return Some(i);
                    }
                }
                if i >= 1 && (chars[i - 1] == '{' || chars[i - 1] == ',') {
                    return Some(i);
                }
            }
        }

        i += 1;
    }

    None
}

/// Find a declaration with $ prefix (e.g., `let $foo`, `const $bar`, `var $baz`).
/// Returns the position of the $ character if found.
fn find_dollar_prefix_declaration(content: &str) -> Option<usize> {
    let chars: Vec<char> = content.chars().collect();
    let mut i = 0;

    while i < chars.len() {
        // Skip single-line comments
        if i + 1 < chars.len() && chars[i] == '/' && chars[i + 1] == '/' {
            while i < chars.len() && chars[i] != '\n' {
                i += 1;
            }
            continue;
        }

        // Skip block comments
        if i + 1 < chars.len() && chars[i] == '/' && chars[i + 1] == '*' {
            i += 2;
            while i + 1 < chars.len() && !(chars[i] == '*' && chars[i + 1] == '/') {
                i += 1;
            }
            i += 2;
            continue;
        }

        // Skip string literals
        if chars[i] == '"' || chars[i] == '\'' || chars[i] == '`' {
            let quote = chars[i];
            i += 1;
            while i < chars.len() {
                if chars[i] == '\\' && i + 1 < chars.len() {
                    i += 2;
                    continue;
                }
                if chars[i] == quote {
                    i += 1;
                    break;
                }
                i += 1;
            }
            continue;
        }

        // Check for "let $", "const $", "var $" patterns
        let patterns = ["let $", "const $", "var $"];
        for pattern in &patterns {
            let pattern_chars: Vec<char> = pattern.chars().collect();
            if i + pattern_chars.len() <= chars.len() {
                let mut matches = true;
                for (j, &pc) in pattern_chars.iter().enumerate() {
                    if chars[i + j] != pc {
                        matches = false;
                        break;
                    }
                }
                if matches {
                    // Check that $ is followed by an identifier character (not a rune call)
                    let dollar_pos = i + pattern.len() - 1;
                    if dollar_pos + 1 < chars.len() {
                        let next_char = chars[dollar_pos + 1];
                        if next_char.is_alphabetic() || next_char == '_' {
                            // Make sure it's not a rune like $state, $derived, etc.
                            let rest: String = chars[dollar_pos..].iter().take(20).collect();
                            if !rest.starts_with("$state")
                                && !rest.starts_with("$derived")
                                && !rest.starts_with("$effect")
                                && !rest.starts_with("$props")
                                && !rest.starts_with("$bindable")
                                && !rest.starts_with("$inspect")
                                && !rest.starts_with("$host")
                            {
                                return Some(dollar_pos);
                            }
                        }
                    }
                }
            }
        }

        i += 1;
    }

    None
}

/// Check if script content uses any runes ($state, $derived, $effect, $props).
fn uses_runes(content: &str) -> bool {
    count_rune_calls(content, "$state(") > 0
        || count_rune_calls(content, "$derived(") > 0
        || count_rune_calls(content, "$effect(") > 0
        || count_rune_calls(content, "$props(") > 0
}

/// Find a rune used without parentheses (e.g., `= $props;` instead of `= $props()`).
/// Returns the rune name and position if found.
fn find_rune_without_parentheses(content: &str) -> Option<(&'static str, usize)> {
    let runes = ["$props", "$bindable", "$state", "$derived", "$effect"];

    for rune in &runes {
        if let Some(pos) = find_rune_without_call(content, rune) {
            return Some((rune, pos));
        }
    }

    None
}

/// Find a specific rune used without being called (no parentheses).
fn find_rune_without_call(content: &str, rune: &str) -> Option<usize> {
    let chars: Vec<char> = content.chars().collect();
    let rune_chars: Vec<char> = rune.chars().collect();
    let mut i = 0;

    while i < chars.len() {
        // Skip single-line comments
        if i + 1 < chars.len() && chars[i] == '/' && chars[i + 1] == '/' {
            while i < chars.len() && chars[i] != '\n' {
                i += 1;
            }
            continue;
        }

        // Skip block comments
        if i + 1 < chars.len() && chars[i] == '/' && chars[i + 1] == '*' {
            i += 2;
            while i + 1 < chars.len() && !(chars[i] == '*' && chars[i + 1] == '/') {
                i += 1;
            }
            i += 2;
            continue;
        }

        // Skip string literals
        if chars[i] == '"' || chars[i] == '\'' || chars[i] == '`' {
            let quote = chars[i];
            i += 1;
            while i < chars.len() {
                if chars[i] == '\\' && i + 1 < chars.len() {
                    i += 2;
                    continue;
                }
                if chars[i] == quote {
                    i += 1;
                    break;
                }
                i += 1;
            }
            continue;
        }

        // Check for rune match
        if i + rune_chars.len() <= chars.len() {
            let mut matches = true;
            for (j, &rc) in rune_chars.iter().enumerate() {
                if chars[i + j] != rc {
                    matches = false;
                    break;
                }
            }
            if matches {
                let after_rune = i + rune_chars.len();
                // Check that the next character is NOT a ( (meaning not called)
                // and is NOT an alphanumeric (meaning it's the full rune name)
                // and is NOT a . (meaning it's not $state.raw, $state.snapshot, etc.)
                if after_rune < chars.len() {
                    let next_char = chars[after_rune];
                    if next_char != '('
                        && next_char != '.'
                        && !next_char.is_alphanumeric()
                        && next_char != '_'
                    {
                        // Check that this is after = (assignment context)
                        // Look backwards for '='
                        let mut j = i as isize - 1;
                        while j >= 0 && chars[j as usize].is_whitespace() {
                            j -= 1;
                        }
                        if j >= 0 && chars[j as usize] == '=' {
                            return Some(i);
                        }
                    }
                }
            }
        }

        i += 1;
    }

    None
}

/// Find "export let" in script content.
/// Returns the position if found.
fn find_export_let(content: &str) -> Option<usize> {
    let chars: Vec<char> = content.chars().collect();
    let pattern: Vec<char> = "export let".chars().collect();
    let mut i = 0;

    while i < chars.len() {
        // Skip single-line comments
        if i + 1 < chars.len() && chars[i] == '/' && chars[i + 1] == '/' {
            while i < chars.len() && chars[i] != '\n' {
                i += 1;
            }
            continue;
        }

        // Skip block comments
        if i + 1 < chars.len() && chars[i] == '/' && chars[i + 1] == '*' {
            i += 2;
            while i + 1 < chars.len() && !(chars[i] == '*' && chars[i + 1] == '/') {
                i += 1;
            }
            i += 2;
            continue;
        }

        // Skip string literals
        if chars[i] == '"' || chars[i] == '\'' || chars[i] == '`' {
            let quote = chars[i];
            i += 1;
            while i < chars.len() {
                if chars[i] == '\\' && i + 1 < chars.len() {
                    i += 2;
                    continue;
                }
                if chars[i] == quote {
                    i += 1;
                    break;
                }
                i += 1;
            }
            continue;
        }

        // Check for "export let" pattern
        if i + pattern.len() <= chars.len() {
            let mut matches = true;
            for (j, &pc) in pattern.iter().enumerate() {
                if chars[i + j] != pc {
                    matches = false;
                    break;
                }
            }
            if matches {
                // Make sure it's at word boundary (start of line or after whitespace)
                if i == 0 || !chars[i - 1].is_alphanumeric() {
                    // Make sure "let" is followed by space or identifier start
                    let after_pattern = i + pattern.len();
                    if after_pattern < chars.len()
                        && (chars[after_pattern].is_whitespace()
                            || chars[after_pattern].is_alphabetic()
                            || chars[after_pattern] == '_'
                            || chars[after_pattern] == '{')
                    {
                        return Some(i);
                    }
                }
            }
        }

        i += 1;
    }

    None
}

/// Find import of beforeUpdate or afterUpdate from 'svelte'.
/// Returns the function name and position if found.
fn find_invalid_runes_import(content: &str) -> Option<(String, usize)> {
    // Look for patterns like: import { beforeUpdate } from 'svelte'
    // or: import { afterUpdate } from 'svelte'
    let chars: Vec<char> = content.chars().collect();
    let mut i = 0;

    while i < chars.len() {
        // Skip single-line comments
        if i + 1 < chars.len() && chars[i] == '/' && chars[i + 1] == '/' {
            while i < chars.len() && chars[i] != '\n' {
                i += 1;
            }
            continue;
        }

        // Skip block comments
        if i + 1 < chars.len() && chars[i] == '/' && chars[i + 1] == '*' {
            i += 2;
            while i + 1 < chars.len() && !(chars[i] == '*' && chars[i + 1] == '/') {
                i += 1;
            }
            i += 2;
            continue;
        }

        // Skip string literals
        if chars[i] == '"' || chars[i] == '\'' || chars[i] == '`' {
            let quote = chars[i];
            i += 1;
            while i < chars.len() {
                if chars[i] == '\\' && i + 1 < chars.len() {
                    i += 2;
                    continue;
                }
                if chars[i] == quote {
                    i += 1;
                    break;
                }
                i += 1;
            }
            continue;
        }

        // Check for "import" keyword
        let import_pattern: Vec<char> = "import".chars().collect();
        if i + import_pattern.len() <= chars.len() {
            let mut matches = true;
            for (j, &pc) in import_pattern.iter().enumerate() {
                if chars[i + j] != pc {
                    matches = false;
                    break;
                }
            }
            if matches && (i == 0 || !chars[i - 1].is_alphanumeric()) {
                let after_import = i + import_pattern.len();
                if after_import < chars.len() && !chars[after_import].is_alphanumeric() {
                    // Found "import", now look for the rest of the line/statement
                    let stmt_start = i;
                    // Find the end of the import statement (semicolon or newline without continuation)
                    let mut j = after_import;
                    let mut in_braces = false;
                    let mut stmt_content = String::new();

                    while j < chars.len() {
                        let c = chars[j];
                        stmt_content.push(c);
                        if c == '{' {
                            in_braces = true;
                        }
                        if c == '}' {
                            in_braces = false;
                        }
                        if c == ';' || (c == '\n' && !in_braces) {
                            break;
                        }
                        j += 1;
                    }

                    // Check if this import is from 'svelte' and imports beforeUpdate or afterUpdate
                    if (stmt_content.contains("'svelte'") || stmt_content.contains("\"svelte\""))
                        && !stmt_content.contains("svelte/")
                    {
                        if stmt_content.contains("beforeUpdate") {
                            return Some(("beforeUpdate".to_string(), stmt_start));
                        }
                        if stmt_content.contains("afterUpdate") {
                            return Some(("afterUpdate".to_string(), stmt_start));
                        }
                    }

                    i = j;
                    continue;
                }
            }
        }

        i += 1;
    }

    None
}

/// Find $host() call in script content.
/// Returns the position if found.
fn find_host_call(content: &str) -> Option<usize> {
    let chars: Vec<char> = content.chars().collect();
    let pattern: Vec<char> = "$host(".chars().collect();
    let mut i = 0;

    while i < chars.len() {
        // Skip single-line comments
        if i + 1 < chars.len() && chars[i] == '/' && chars[i + 1] == '/' {
            while i < chars.len() && chars[i] != '\n' {
                i += 1;
            }
            continue;
        }

        // Skip block comments
        if i + 1 < chars.len() && chars[i] == '/' && chars[i + 1] == '*' {
            i += 2;
            while i + 1 < chars.len() && !(chars[i] == '*' && chars[i + 1] == '/') {
                i += 1;
            }
            i += 2;
            continue;
        }

        // Skip string literals
        if chars[i] == '"' || chars[i] == '\'' || chars[i] == '`' {
            let quote = chars[i];
            i += 1;
            while i < chars.len() {
                if chars[i] == '\\' && i + 1 < chars.len() {
                    i += 2;
                    continue;
                }
                if chars[i] == quote {
                    i += 1;
                    break;
                }
                i += 1;
            }
            continue;
        }

        // Check for "$host(" pattern
        if i + pattern.len() <= chars.len() {
            let mut matches = true;
            for (j, &pc) in pattern.iter().enumerate() {
                if chars[i + j] != pc {
                    matches = false;
                    break;
                }
            }
            if matches {
                return Some(i);
            }
        }

        i += 1;
    }

    None
}

/// Find $effect() inside a return statement.
/// Returns position if found.
fn find_effect_in_return(content: &str) -> Option<usize> {
    // Look for "return $effect(" or "return $effect.pre(" or "return $effect.root("
    let chars: Vec<char> = content.chars().collect();
    let mut i = 0;

    while i < chars.len() {
        // Skip single-line comments
        if i + 1 < chars.len() && chars[i] == '/' && chars[i + 1] == '/' {
            while i < chars.len() && chars[i] != '\n' {
                i += 1;
            }
            continue;
        }

        // Skip block comments
        if i + 1 < chars.len() && chars[i] == '/' && chars[i + 1] == '*' {
            i += 2;
            while i + 1 < chars.len() && !(chars[i] == '*' && chars[i + 1] == '/') {
                i += 1;
            }
            i += 2;
            continue;
        }

        // Skip string literals
        if chars[i] == '"' || chars[i] == '\'' || chars[i] == '`' {
            let quote = chars[i];
            i += 1;
            while i < chars.len() {
                if chars[i] == '\\' && i + 1 < chars.len() {
                    i += 2;
                    continue;
                }
                if chars[i] == quote {
                    i += 1;
                    break;
                }
                i += 1;
            }
            continue;
        }

        // Check for return keyword
        if i + 6 <= chars.len() {
            let word: String = chars[i..i + 6].iter().collect();
            if word == "return" {
                // Check that it's a word boundary
                let before_ok = i == 0 || !chars[i - 1].is_alphanumeric();
                let after_ok = i + 6 >= chars.len() || !chars[i + 6].is_alphanumeric();
                if before_ok && after_ok {
                    // Skip whitespace after return
                    let mut j = i + 6;
                    while j < chars.len() && chars[j].is_whitespace() {
                        j += 1;
                    }
                    // Check for $effect patterns
                    for pattern in &["$effect(", "$effect.pre(", "$effect.root("] {
                        let pattern_chars: Vec<char> = pattern.chars().collect();
                        if j + pattern_chars.len() <= chars.len() {
                            let mut matches = true;
                            for (k, &pc) in pattern_chars.iter().enumerate() {
                                if chars[j + k] != pc {
                                    matches = false;
                                    break;
                                }
                            }
                            if matches {
                                return Some(j); // Return the position of $effect
                            }
                        }
                    }
                }
            }
        }

        i += 1;
    }

    None
}

/// Find $bindable() used outside of $props() context.
/// Returns position if found.
fn find_bindable_outside_props(content: &str) -> Option<usize> {
    // $bindable() is only valid inside $props() destructuring
    // Valid: const { a = $bindable() } = $props()
    // Invalid: const { a = $bindable() } = $state()
    // Invalid: const { a = $bindable() } = something

    // We need to find $bindable( and then check if it's part of a = $props() assignment
    let chars: Vec<char> = content.chars().collect();
    let bindable_pattern: Vec<char> = "$bindable(".chars().collect();
    let mut i = 0;

    while i < chars.len() {
        // Skip single-line comments
        if i + 1 < chars.len() && chars[i] == '/' && chars[i + 1] == '/' {
            while i < chars.len() && chars[i] != '\n' {
                i += 1;
            }
            continue;
        }

        // Skip block comments
        if i + 1 < chars.len() && chars[i] == '/' && chars[i + 1] == '*' {
            i += 2;
            while i + 1 < chars.len() && !(chars[i] == '*' && chars[i + 1] == '/') {
                i += 1;
            }
            i += 2;
            continue;
        }

        // Skip string literals
        if chars[i] == '"' || chars[i] == '\'' || chars[i] == '`' {
            let quote = chars[i];
            i += 1;
            while i < chars.len() {
                if chars[i] == '\\' && i + 1 < chars.len() {
                    i += 2;
                    continue;
                }
                if chars[i] == quote {
                    i += 1;
                    break;
                }
                i += 1;
            }
            continue;
        }

        // Check for $bindable( pattern
        if i + bindable_pattern.len() <= chars.len() {
            let mut matches = true;
            for (j, &pc) in bindable_pattern.iter().enumerate() {
                if chars[i + j] != pc {
                    matches = false;
                    break;
                }
            }
            if matches {
                // Found $bindable(, now check if this is inside a $props() assignment
                // Look for the assignment pattern: } = $props()
                // We need to find the closing } and then = $props()

                // First, skip to the end of the $bindable(...) call
                let bindable_start = i;
                i += bindable_pattern.len();
                let mut depth = 1;
                while i < chars.len() && depth > 0 {
                    if chars[i] == '(' {
                        depth += 1;
                    } else if chars[i] == ')' {
                        depth -= 1;
                    }
                    i += 1;
                }

                // Now find the closing }
                depth = 0;
                let mut found_closing_brace = false;
                while i < chars.len() {
                    if chars[i] == '{' {
                        depth += 1;
                    } else if chars[i] == '}' {
                        if depth == 0 {
                            found_closing_brace = true;
                            i += 1;
                            break;
                        }
                        depth -= 1;
                    }
                    i += 1;
                }

                if !found_closing_brace {
                    return Some(bindable_start);
                }

                // Skip whitespace
                while i < chars.len() && chars[i].is_whitespace() {
                    i += 1;
                }

                // Check for = $props()
                if i < chars.len() && chars[i] == '=' {
                    i += 1;
                    while i < chars.len() && chars[i].is_whitespace() {
                        i += 1;
                    }
                    // Check for $props(
                    let props_pattern: Vec<char> = "$props(".chars().collect();
                    if i + props_pattern.len() <= chars.len() {
                        let mut is_props = true;
                        for (j, &pc) in props_pattern.iter().enumerate() {
                            if chars[i + j] != pc {
                                is_props = false;
                                break;
                            }
                        }
                        if is_props {
                            // This is valid: $bindable inside $props()
                            continue;
                        }
                    }
                }

                // If we get here, $bindable is not inside $props()
                return Some(bindable_start);
            }
        }

        i += 1;
    }

    None
}

/// Find $props() called with arguments (not allowed).
/// Returns position if found.
fn find_props_with_arguments(content: &str) -> Option<usize> {
    // $props must have exactly 0 arguments
    // So we look for $props with arg_count > 0
    let chars: Vec<char> = content.chars().collect();
    let pattern: &str = "$props(";
    let pattern_chars: Vec<char> = pattern.chars().collect();
    let mut i = 0;

    while i < chars.len() {
        // Skip single-line comments
        if i + 1 < chars.len() && chars[i] == '/' && chars[i + 1] == '/' {
            while i < chars.len() && chars[i] != '\n' {
                i += 1;
            }
            continue;
        }

        // Skip block comments
        if i + 1 < chars.len() && chars[i] == '/' && chars[i + 1] == '*' {
            i += 2;
            while i + 1 < chars.len() && !(chars[i] == '*' && chars[i + 1] == '/') {
                i += 1;
            }
            i += 2;
            continue;
        }

        // Skip string literals
        if chars[i] == '"' || chars[i] == '\'' || chars[i] == '`' {
            let quote = chars[i];
            i += 1;
            while i < chars.len() {
                if chars[i] == '\\' && i + 1 < chars.len() {
                    i += 2;
                    continue;
                }
                if chars[i] == quote {
                    i += 1;
                    break;
                }
                i += 1;
            }
            continue;
        }

        // Check for pattern match
        if i + pattern_chars.len() <= chars.len() {
            let mut matches = true;
            for (j, &pc) in pattern_chars.iter().enumerate() {
                if chars[i + j] != pc {
                    matches = false;
                    break;
                }
            }
            if matches {
                // Found $props(, now count arguments
                let arg_start = i + pattern_chars.len();
                if let Some(arg_count) = count_arguments(&chars, arg_start) {
                    // $props should have 0 arguments
                    if arg_count > 0 {
                        return Some(i);
                    }
                }
                i += pattern_chars.len();
                continue;
            }
        }

        i += 1;
    }

    None
}

/// Find rune calls with invalid argument count.
/// Returns (rune_name, expected_description, position) if found.
fn find_invalid_rune_arguments(content: &str) -> Option<(&'static str, &'static str, usize)> {
    // Runes and their expected argument counts:
    // $state() - 0 or 1 argument
    // $state.raw() - 0 or 1 argument
    // $state.snapshot() - exactly 1 argument
    // $derived() - exactly 1 argument
    // $derived.by() - exactly 1 argument
    // $effect() - exactly 1 argument
    // $effect.pre() - exactly 1 argument
    // $effect.root() - exactly 1 argument
    // $props() - 0 arguments
    // $bindable() - 0 or 1 argument
    // $inspect() - at least 1 argument

    let checks = [
        ("$state(", 0, 1, "zero or one arguments"),
        ("$state.raw(", 0, 1, "zero or one arguments"),
        ("$state.snapshot(", 1, 1, "exactly one argument"),
        ("$derived(", 1, 1, "exactly one argument"),
        ("$derived.by(", 1, 1, "exactly one argument"),
        ("$effect(", 1, 1, "exactly one argument"),
        ("$effect.pre(", 1, 1, "exactly one argument"),
        ("$effect.root(", 1, 1, "exactly one argument"),
        ("$bindable(", 0, 1, "zero or one arguments"),
    ];

    for (pattern, min_args, max_args, expected) in checks {
        if let Some(pos) = find_rune_with_wrong_arg_count(content, pattern, min_args, max_args) {
            // Extract the rune name from the pattern (remove the trailing '(')
            let rune_name = &pattern[..pattern.len() - 1];
            return Some((rune_name, expected, pos));
        }
    }

    None
}

/// Find a rune call with wrong argument count.
fn find_rune_with_wrong_arg_count(
    content: &str,
    pattern: &str,
    min_args: usize,
    max_args: usize,
) -> Option<usize> {
    let chars: Vec<char> = content.chars().collect();
    let pattern_chars: Vec<char> = pattern.chars().collect();
    let mut i = 0;

    while i < chars.len() {
        // Skip single-line comments
        if i + 1 < chars.len() && chars[i] == '/' && chars[i + 1] == '/' {
            while i < chars.len() && chars[i] != '\n' {
                i += 1;
            }
            continue;
        }

        // Skip block comments
        if i + 1 < chars.len() && chars[i] == '/' && chars[i + 1] == '*' {
            i += 2;
            while i + 1 < chars.len() && !(chars[i] == '*' && chars[i + 1] == '/') {
                i += 1;
            }
            i += 2;
            continue;
        }

        // Skip string literals
        if chars[i] == '"' || chars[i] == '\'' || chars[i] == '`' {
            let quote = chars[i];
            i += 1;
            while i < chars.len() {
                if chars[i] == '\\' && i + 1 < chars.len() {
                    i += 2;
                    continue;
                }
                if chars[i] == quote {
                    i += 1;
                    break;
                }
                i += 1;
            }
            continue;
        }

        // Check for pattern match
        if i + pattern_chars.len() <= chars.len() {
            let mut matches = true;
            for (j, &pc) in pattern_chars.iter().enumerate() {
                if chars[i + j] != pc {
                    matches = false;
                    break;
                }
            }
            if matches {
                // Found the pattern, now count arguments
                let arg_start = i + pattern_chars.len();
                if let Some(arg_count) = count_arguments(&chars, arg_start)
                    && (arg_count < min_args || arg_count > max_args)
                {
                    return Some(i);
                }
                i += pattern_chars.len();
                continue;
            }
        }

        i += 1;
    }

    None
}

/// Count the number of arguments in a function call starting at the given position.
/// Returns None if the argument list is malformed.
fn count_arguments(chars: &[char], start: usize) -> Option<usize> {
    let mut i = start;
    let mut depth = 1; // We're already inside the opening (
    let mut arg_count = 0;
    let mut has_content = false;

    while i < chars.len() && depth > 0 {
        let c = chars[i];

        // Skip string literals
        if c == '"' || c == '\'' || c == '`' {
            let quote = c;
            i += 1;
            while i < chars.len() {
                if chars[i] == '\\' && i + 1 < chars.len() {
                    i += 2;
                    continue;
                }
                if chars[i] == quote {
                    i += 1;
                    break;
                }
                i += 1;
            }
            has_content = true;
            continue;
        }

        match c {
            '(' | '[' | '{' => {
                depth += 1;
                has_content = true;
            }
            ')' | ']' | '}' => {
                depth -= 1;
                if depth == 0 && c == ')' {
                    // End of arguments
                    if has_content {
                        arg_count += 1;
                    }
                }
            }
            ',' => {
                if depth == 1 {
                    // This is a top-level comma, separating arguments
                    arg_count += 1;
                    has_content = false;
                }
            }
            _ => {
                if !c.is_whitespace() {
                    has_content = true;
                }
            }
        }

        i += 1;
    }

    if depth == 0 {
        Some(arg_count)
    } else {
        None // Malformed
    }
}

/// Count occurrences of a rune call pattern in script content.
/// Attempts to skip occurrences inside comments and string literals.
fn count_rune_calls(content: &str, pattern: &str) -> usize {
    let mut count = 0;
    let chars: Vec<char> = content.chars().collect();
    let pattern_chars: Vec<char> = pattern.chars().collect();
    let mut i = 0;

    while i < chars.len() {
        // Skip single-line comments
        if i + 1 < chars.len() && chars[i] == '/' && chars[i + 1] == '/' {
            while i < chars.len() && chars[i] != '\n' {
                i += 1;
            }
            continue;
        }

        // Skip block comments
        if i + 1 < chars.len() && chars[i] == '/' && chars[i + 1] == '*' {
            i += 2;
            while i + 1 < chars.len() && !(chars[i] == '*' && chars[i + 1] == '/') {
                i += 1;
            }
            i += 2;
            continue;
        }

        // Skip string literals
        if chars[i] == '"' || chars[i] == '\'' || chars[i] == '`' {
            let quote = chars[i];
            i += 1;
            while i < chars.len() {
                if chars[i] == '\\' && i + 1 < chars.len() {
                    i += 2;
                    continue;
                }
                if chars[i] == quote {
                    i += 1;
                    break;
                }
                i += 1;
            }
            continue;
        }

        // Check for pattern match
        if i + pattern_chars.len() <= chars.len() {
            let mut matches = true;
            for (j, &pc) in pattern_chars.iter().enumerate() {
                if chars[i + j] != pc {
                    matches = false;
                    break;
                }
            }
            if matches {
                count += 1;
                i += pattern_chars.len();
                continue;
            }
        }

        i += 1;
    }

    count
}
