//! Class field transformations for $state and $derived runes.

use super::REGEX_INVALID_IDENTIFIER_CHARS;
use super::expression_needs_proxy;
use super::find_matching_paren;

/// Represents a class field with $state or $derived rune.
#[derive(Debug, Clone)]
pub(super) struct ClassStateField {
    /// Field name (without # prefix)
    pub(super) name: String,
    /// Whether this is a private field (starts with #)
    pub(super) is_private: bool,
    /// The rune type: "$state" or "$derived"
    pub(super) rune_type: String,
    /// The initial value/expression
    pub(super) value: String,
    /// The deconflicted private backing field name (without # prefix)
    /// For private fields, this is the same as name.
    /// For public fields, this may have _ prefix if it conflicts with existing private fields.
    pub(super) private_backing_name: String,
    /// Whether this field was declared in the constructor
    pub(super) constructor_declared: bool,
}

/// Helper to parse rune fields from a section of class body lines.
/// Returns (fields, non_rune_lines).
/// Handles multi-line field declarations (e.g., $derived.by(() => { ... })).
#[allow(dead_code)]
pub(super) fn parse_rune_fields_from_section(section: &str) -> (Vec<ClassStateField>, Vec<String>) {
    let mut fields = Vec::new();
    let mut non_rune_lines = Vec::new();

    let lines: Vec<&str> = section.lines().collect();
    let mut i = 0;

    while i < lines.len() {
        let line = lines[i];
        let trimmed = line.trim();
        if trimmed.is_empty() {
            i += 1;
            continue;
        }

        // Try to parse as a single-line rune field first
        let rune_types = [
            ("$state.raw", true),
            ("$state.frozen", true),
            ("$state", false),
            ("$derived.by", true),
            ("$derived", false),
        ];

        let mut parsed = false;
        for &(rune_type, _is_compound) in &rune_types {
            let pattern = format!("= {}(", rune_type);
            let pattern_no_space = format!("={}(", rune_type);

            let has_pattern = trimmed.contains(&pattern) || trimmed.contains(&pattern_no_space);
            if !has_pattern {
                continue;
            }

            // Skip if checking $state but it's actually $state.raw or $state.frozen
            if rune_type == "$state"
                && (trimmed.contains("$state.raw(")
                    || trimmed.contains("$state.frozen(")
                    || trimmed.contains("$state.frozen("))
            {
                continue;
            }
            // Skip if checking $derived but it's actually $derived.by
            if rune_type == "$derived"
                && (trimmed.contains("$derived.by(") || trimmed.contains("$derived.by("))
            {
                continue;
            }

            // Try single-line parse
            if let Some(field) = parse_state_field(trimmed, rune_type) {
                fields.push(field);
                parsed = true;
                break;
            }

            // Single-line parse failed - might be a multi-line expression
            // Accumulate lines until parens are balanced
            let mut accumulated = trimmed.to_string();
            let mut j = i + 1;
            while j < lines.len() {
                accumulated.push('\n');
                accumulated.push_str(lines[j].trim());
                // Try parsing the accumulated content
                if let Some(field) = parse_state_field(&accumulated, rune_type) {
                    fields.push(field);
                    parsed = true;
                    i = j; // Skip all accumulated lines
                    break;
                }
                j += 1;
            }
            if parsed {
                break;
            }
        }

        if !parsed {
            non_rune_lines.push(line.to_string());
        }
        i += 1;
    }

    (fields, non_rune_lines)
}

/// Emit a transformed class field definition with optional getter/setter.
pub(super) fn emit_class_field(field: &ClassStateField, all_fields: &[ClassStateField]) -> String {
    let mut output = String::new();
    let private_name = format!("#{}", field.private_backing_name);

    if field.constructor_declared {
        output.push_str(&format!("\t\t{};\n", private_name));
        if !field.is_private {
            let is_derived = field.rune_type == "$derived" || field.rune_type == "$derived.by";
            let is_raw = field.rune_type == "$state.raw" || field.rune_type == "$state.frozen";
            output.push('\n');
            output.push_str(&format!(
                "\t\tget {}() {{\n\t\t\treturn $.get(this.{});\n\t\t}}\n",
                field.name, private_name
            ));
            output.push('\n');
            if is_derived || is_raw {
                output.push_str(&format!(
                    "\t\tset {}(value) {{\n\t\t\t$.set(this.{}, value);\n\t\t}}\n",
                    field.name, private_name
                ));
            } else {
                output.push_str(&format!(
                    "\t\tset {}(value) {{\n\t\t\t$.set(this.{}, value, true);\n\t\t}}\n",
                    field.name, private_name
                ));
            }
        }
    } else if field.rune_type == "$state" {
        let value_trimmed = field.value.trim();
        let needs_proxy = !value_trimmed.is_empty() && expression_needs_proxy(value_trimmed);
        let wrapped_value = if needs_proxy {
            format!("$.proxy({})", field.value)
        } else {
            field.value.clone()
        };
        output.push_str(&format!(
            "\t\t{} = $.state({});\n",
            private_name, wrapped_value
        ));
        if !field.is_private {
            let getter_name = format_getter_name(&field.name);
            output.push('\n');
            output.push_str(&format!(
                "\t\tget {}() {{\n\t\t\treturn $.get(this.{});\n\t\t}}\n",
                getter_name, private_name
            ));
            output.push('\n');
            output.push_str(&format!(
                "\t\tset {}(value) {{\n\t\t\t$.set(this.{}, value, true);\n\t\t}}\n",
                getter_name, private_name
            ));
        }
    } else if field.rune_type == "$state.raw" || field.rune_type == "$state.frozen" {
        output.push_str(&format!(
            "\t\t{} = $.state({});\n",
            private_name, field.value
        ));
        if !field.is_private {
            let getter_name = format_getter_name(&field.name);
            output.push('\n');
            output.push_str(&format!(
                "\t\tget {}() {{\n\t\t\treturn $.get(this.{});\n\t\t}}\n",
                getter_name, private_name
            ));
            output.push('\n');
            output.push_str(&format!(
                "\t\tset {}(value) {{\n\t\t\t$.set(this.{}, value);\n\t\t}}\n",
                getter_name, private_name
            ));
        }
    } else if field.rune_type == "$derived" {
        // Transform private field accesses inside the derived expression
        let mut derived_expr = field.value.clone();
        for f in all_fields {
            if f.is_private {
                let private_ref = format!("this.#{}", f.private_backing_name);
                if derived_expr.contains(&private_ref) {
                    let getter = format!("$.get(this.#{})", f.private_backing_name);
                    derived_expr = derived_expr.replace(&private_ref, &getter);
                }
            }
        }
        let wrapped_value = if derived_expr.trim_start().starts_with('{') {
            format!("() => ({})", derived_expr)
        } else {
            format!("() => {}", derived_expr)
        };
        output.push_str(&format!(
            "\t\t{} = $.derived({});\n",
            private_name, wrapped_value
        ));
        if !field.is_private {
            let getter_name = format_getter_name(&field.name);
            output.push('\n');
            output.push_str(&format!(
                "\t\tget {}() {{\n\t\t\treturn $.get(this.{});\n\t\t}}\n",
                getter_name, private_name
            ));
            output.push('\n');
            output.push_str(&format!(
                "\t\tset {}(value) {{\n\t\t\t$.set(this.{}, value);\n\t\t}}\n",
                getter_name, private_name
            ));
        }
    } else if field.rune_type == "$derived.by" {
        let mut derived_expr = field.value.clone();
        for f in all_fields {
            if f.is_private {
                let private_ref = format!("this.#{}", f.private_backing_name);
                if derived_expr.contains(&private_ref) {
                    let getter = format!("$.get(this.#{})", f.private_backing_name);
                    derived_expr = derived_expr.replace(&private_ref, &getter);
                }
            }
        }
        output.push_str(&format!(
            "\t\t{} = $.derived({});\n",
            private_name, derived_expr
        ));
        if !field.is_private {
            let getter_name = format_getter_name(&field.name);
            output.push('\n');
            output.push_str(&format!(
                "\t\tget {}() {{\n\t\t\treturn $.get(this.{});\n\t\t}}\n",
                getter_name, private_name
            ));
            output.push('\n');
            output.push_str(&format!(
                "\t\tset {}(value) {{\n\t\t\t$.set(this.{}, value);\n\t\t}}\n",
                getter_name, private_name
            ));
        }
    }

    output
}

/// Extract a private identifier name from a line that may have a keyword prefix.
pub(super) fn extract_private_id_from_line(trimmed: &str) -> Option<String> {
    if let Some(rest) = trimmed.strip_prefix('#') {
        if let Some(end) = rest.find(['=', ';', '(', ' ']) {
            let name = rest[..end].trim();
            if !name.is_empty() {
                return Some(name.to_string());
            }
        }
        return None;
    }
    let prefixes = ["async ", "get ", "set ", "static ", "* "];
    for prefix in &prefixes {
        if let Some(rest) = trimmed.strip_prefix(prefix) {
            let rest = rest.trim_start();
            if let Some(rest) = rest.strip_prefix('#')
                && let Some(end) = rest.find(['=', ';', '(', ' '])
            {
                let name = rest[..end].trim();
                if !name.is_empty() {
                    return Some(name.to_string());
                }
            }
        }
    }
    if let Some(rest) = trimmed.strip_prefix("async") {
        let rest = rest.trim_start();
        if let Some(rest) = rest.strip_prefix('*') {
            let rest = rest.trim_start();
            if let Some(rest) = rest.strip_prefix('#')
                && let Some(end) = rest.find(['=', ';', '(', ' '])
            {
                let name = rest[..end].trim();
                if !name.is_empty() {
                    return Some(name.to_string());
                }
            }
        }
    }
    None
}

/// Transform private field reads in constructor body.
pub(super) fn transform_constructor_private_reads(
    content: &str,
    fields: &[ClassStateField],
) -> String {
    let mut result = content.to_string();

    for field in fields {
        if !field.is_private {
            continue;
        }

        let private_ref = format!("this.#{}", field.private_backing_name);

        if field.rune_type == "$state"
            || field.rune_type == "$state.raw"
            || field.rune_type == "$state.frozen"
        {
            let mut search_from = 0;
            let mut new_result = String::new();
            let mut last_end = 0;

            while let Some(pos) = result[search_from..].find(&private_ref) {
                let abs_pos = search_from + pos;
                let after_pos = abs_pos + private_ref.len();

                let before = &result[..abs_pos];
                if before.ends_with("$.set(")
                    || before.ends_with("$.get(")
                    || before.ends_with("$.state(")
                    || before.ends_with("$.update(")
                    || before.ends_with("$.update_pre(")
                {
                    search_from = after_pos;
                    continue;
                }

                let next_char = if after_pos < result.len() {
                    Some(result.as_bytes()[after_pos] as char)
                } else {
                    None
                };

                match next_char {
                    Some(' ') => {
                        if after_pos + 1 < result.len() && result.as_bytes()[after_pos + 1] == b'='
                        {
                            if after_pos + 2 < result.len()
                                && result.as_bytes()[after_pos + 2] == b'='
                            {
                                // == comparison -> use .v
                            } else {
                                search_from = after_pos;
                                continue;
                            }
                        }
                    }
                    Some('=') => {
                        if after_pos + 1 < result.len() && result.as_bytes()[after_pos + 1] == b'='
                        {
                            // == comparison -> use .v
                        } else {
                            search_from = after_pos;
                            continue;
                        }
                    }
                    Some('.') => {
                        search_from = after_pos;
                        continue;
                    }
                    Some(c) if c.is_alphanumeric() || c == '_' => {
                        search_from = after_pos;
                        continue;
                    }
                    _ => {}
                }

                new_result.push_str(&result[last_end..after_pos]);
                new_result.push_str(".v");
                last_end = after_pos;
                search_from = after_pos;
            }

            if last_end > 0 {
                new_result.push_str(&result[last_end..]);
                result = new_result;
            }
        } else if field.rune_type == "$derived" || field.rune_type == "$derived.by" {
            let mut search_from = 0;
            let mut new_result = String::new();
            let mut last_end = 0;

            while let Some(pos) = result[search_from..].find(&private_ref) {
                let abs_pos = search_from + pos;
                let after_pos = abs_pos + private_ref.len();

                let before = &result[..abs_pos];
                if before.ends_with("$.set(")
                    || before.ends_with("$.get(")
                    || before.ends_with("$.state(")
                    || before.ends_with("$.derived(")
                    || before.ends_with("$.update(")
                    || before.ends_with("$.update_pre(")
                {
                    search_from = after_pos;
                    continue;
                }

                let next_char = if after_pos < result.len() {
                    Some(result.as_bytes()[after_pos] as char)
                } else {
                    None
                };

                match next_char {
                    Some(' ') => {
                        if after_pos + 1 < result.len() && result.as_bytes()[after_pos + 1] == b'='
                        {
                            if after_pos + 2 < result.len()
                                && result.as_bytes()[after_pos + 2] == b'='
                            {
                                // comparison
                            } else {
                                search_from = after_pos;
                                continue;
                            }
                        }
                    }
                    Some('=') => {
                        if after_pos + 1 < result.len() && result.as_bytes()[after_pos + 1] == b'='
                        {
                            // comparison
                        } else {
                            search_from = after_pos;
                            continue;
                        }
                    }
                    Some(c) if c.is_alphanumeric() || c == '_' => {
                        search_from = after_pos;
                        continue;
                    }
                    _ => {}
                }

                new_result.push_str(&result[last_end..abs_pos]);
                new_result.push_str(&format!("$.get({})", private_ref));
                last_end = after_pos;
                search_from = after_pos;
            }

            if last_end > 0 {
                new_result.push_str(&result[last_end..]);
                result = new_result;
            }
        }
    }

    result
}

/// Transform class fields with $state and $derived runes for client-side.
pub(crate) fn transform_class_fields_client(script: &str) -> String {
    // Check if script contains a class with $state or $derived fields
    if !script.contains("class ") || (!script.contains("$state") && !script.contains("$derived")) {
        return script.to_string();
    }

    // Find the class body
    let Some(class_pos) = script.find("class ") else {
        return script.to_string();
    };

    // Find the opening brace of the class
    let after_class = &script[class_pos..];
    let Some(brace_pos) = after_class.find('{') else {
        return script.to_string();
    };

    let class_header = &after_class[..brace_pos + 1];

    // Find matching closing brace
    let class_body_start = class_pos + brace_pos + 1;
    let mut brace_depth = 1;
    let mut class_body_end = class_body_start;

    for (i, c) in script[class_body_start..].char_indices() {
        match c {
            '{' => brace_depth += 1,
            '}' => {
                brace_depth -= 1;
                if brace_depth == 0 {
                    class_body_end = class_body_start + i;
                    break;
                }
            }
            _ => {}
        }
    }

    let class_body = &script[class_body_start..class_body_end];

    // Parse constructor info
    let mut constructor_content = String::new();
    let mut constructor_params = String::new();
    let mut constructor_start: Option<usize> = None;
    let mut constructor_end: Option<usize> = None;

    // Find constructor first
    if let Some(ctor_pos) = class_body.find("constructor(") {
        let after_ctor = &class_body[ctor_pos..];
        // Extract constructor parameters
        if let Some(paren_start) = after_ctor.find('(') {
            let params_start = paren_start + 1;
            let mut depth = 1;
            let mut params_end = params_start;
            for (i, c) in after_ctor[params_start..].char_indices() {
                match c {
                    '(' => depth += 1,
                    ')' => {
                        depth -= 1;
                        if depth == 0 {
                            params_end = params_start + i;
                            break;
                        }
                    }
                    _ => {}
                }
            }
            constructor_params = after_ctor[params_start..params_end].to_string();
        }

        if let Some(brace_pos_inner) = after_ctor.find('{') {
            let ctor_body_start = ctor_pos + brace_pos_inner + 1;
            let mut depth = 1;
            let mut ctor_body_end = ctor_body_start;

            for (i, c) in class_body[ctor_body_start..].char_indices() {
                match c {
                    '{' => depth += 1,
                    '}' => {
                        depth -= 1;
                        if depth == 0 {
                            ctor_body_end = ctor_body_start + i;
                            break;
                        }
                    }
                    _ => {}
                }
            }

            constructor_start = Some(ctor_pos);
            constructor_content = class_body[ctor_body_start..ctor_body_end].to_string();
            constructor_end = Some(ctor_body_end + 1);
        }
    }

    // Collect existing private identifiers to avoid conflicts
    let mut existing_private_ids: Vec<String> = Vec::new();
    for line in class_body.lines() {
        let trimmed = line.trim();
        if let Some(name) = extract_private_id_from_line(trimmed)
            && !existing_private_ids.contains(&name)
        {
            existing_private_ids.push(name);
        }
    }

    // Parse the entire class body into ordered members.
    // Each member is either a rune field, a non-rune member block, or the constructor.
    #[derive(Debug)]
    enum ClassMember {
        RuneField(usize), // index into fields vec
        NonRune(String),  // raw text of the non-rune member(s)
        Constructor,      // placeholder for the constructor position
    }

    let mut fields: Vec<ClassStateField> = Vec::new();
    let mut members: Vec<ClassMember> = Vec::new();
    // Track non-rune lines that might be plain field declarations for constructor fields
    let mut non_rune_plain_field_names: Vec<(usize, String)> = Vec::new(); // (member_idx, field_name)

    // Split class body into before-constructor and after-constructor sections
    let before_ctor_section = if let Some(ctor_start) = constructor_start {
        &class_body[..ctor_start]
    } else {
        class_body
    };
    let after_ctor_section = if let Some(ctor_end) = constructor_end {
        &class_body[ctor_end..]
    } else {
        ""
    };

    // Parse members from a section of the class body (before or after constructor)
    // Returns ordered list of members and appends fields to the fields vec
    let parse_section_members =
        |section: &str,
         fields: &mut Vec<ClassStateField>,
         members: &mut Vec<ClassMember>,
         non_rune_plain_field_names: &mut Vec<(usize, String)>| {
            let section_lines: Vec<&str> = section.lines().collect();
            let mut si = 0;
            let mut pending_non_rune: Vec<String> = Vec::new();

            while si < section_lines.len() {
                let line = section_lines[si];
                let trimmed = line.trim();
                if trimmed.is_empty() {
                    si += 1;
                    continue;
                }

                // Try to parse as a rune field
                let rune_types_list = [
                    ("$state.raw", true),
                    ("$state.frozen", true),
                    ("$state", false),
                    ("$derived.by", true),
                    ("$derived", false),
                ];

                let mut parsed_as_rune = false;
                for &(rune_type, _) in &rune_types_list {
                    let pattern_eq = format!("= {}(", rune_type);
                    let pattern_nospace = format!("={}(", rune_type);
                    let has_pattern =
                        trimmed.contains(&pattern_eq) || trimmed.contains(&pattern_nospace);
                    if !has_pattern {
                        continue;
                    }
                    if rune_type == "$state"
                        && (trimmed.contains("$state.raw(") || trimmed.contains("$state.frozen("))
                    {
                        continue;
                    }
                    if rune_type == "$derived" && trimmed.contains("$derived.by(") {
                        continue;
                    }

                    // Try single-line parse
                    if let Some(field) = parse_state_field(trimmed, rune_type) {
                        // Flush pending non-rune lines
                        if !pending_non_rune.is_empty() {
                            let content = pending_non_rune.join("\n");
                            members.push(ClassMember::NonRune(content));
                            pending_non_rune.clear();
                        }
                        let field_idx = fields.len();
                        fields.push(field);
                        members.push(ClassMember::RuneField(field_idx));
                        parsed_as_rune = true;
                        break;
                    }

                    // Multi-line parse
                    let mut accumulated = trimmed.to_string();
                    let mut j = si + 1;
                    while j < section_lines.len() {
                        accumulated.push('\n');
                        accumulated.push_str(section_lines[j].trim());
                        if let Some(field) = parse_state_field(&accumulated, rune_type) {
                            // Flush pending non-rune lines
                            if !pending_non_rune.is_empty() {
                                let content = pending_non_rune.join("\n");
                                members.push(ClassMember::NonRune(content));
                                pending_non_rune.clear();
                            }
                            let field_idx = fields.len();
                            fields.push(field);
                            members.push(ClassMember::RuneField(field_idx));
                            parsed_as_rune = true;
                            si = j; // Skip accumulated lines
                            break;
                        }
                        j += 1;
                    }
                    if parsed_as_rune {
                        break;
                    }
                }

                if !parsed_as_rune {
                    // Track plain field declarations for later removal by constructor fields
                    let field_trimmed = trimmed.trim_end_matches(';').trim();
                    if !field_trimmed.contains('(')
                        && !field_trimmed.contains('{')
                        && !field_trimmed.starts_with("//")
                        && !field_trimmed.starts_with("/*")
                    {
                        // Flush current pending + this line, remember its member index
                        if !pending_non_rune.is_empty() {
                            let content = pending_non_rune.join("\n");
                            members.push(ClassMember::NonRune(content));
                            pending_non_rune.clear();
                        }
                        let member_idx = members.len();
                        let name = field_trimmed.trim_start_matches('#').trim().to_string();
                        if !name.is_empty()
                            && name
                                .chars()
                                .next()
                                .is_some_and(|c| c.is_alphabetic() || c == '_' || c == '$')
                        {
                            non_rune_plain_field_names.push((member_idx, name));
                        }
                        members.push(ClassMember::NonRune(line.to_string()));
                    } else {
                        pending_non_rune.push(line.to_string());
                    }
                }
                si += 1;
            }

            // Flush any remaining non-rune lines
            if !pending_non_rune.is_empty() {
                let content = pending_non_rune.join("\n");
                members.push(ClassMember::NonRune(content));
            }
        };

    // Parse before-constructor members
    parse_section_members(
        before_ctor_section,
        &mut fields,
        &mut members,
        &mut non_rune_plain_field_names,
    );

    // Add constructor marker
    if constructor_start.is_some() {
        members.push(ClassMember::Constructor);
    }

    // Parse after-constructor members
    parse_section_members(
        after_ctor_section,
        &mut fields,
        &mut members,
        &mut non_rune_plain_field_names,
    );

    // Scan constructor body for constructor-declared state/derived assignments
    if !constructor_content.is_empty() {
        for line in constructor_content.lines() {
            let trimmed = line.trim();
            if trimmed.is_empty() {
                continue;
            }
            if let Some(field) = parse_constructor_state_assignment(trimmed, &fields) {
                let field_name = field.name.clone();
                // Remove plain field declarations from members that match this constructor field
                let mut indices_to_remove: Vec<usize> = Vec::new();
                for &(member_idx, ref name) in &non_rune_plain_field_names {
                    if *name == field_name {
                        indices_to_remove.push(member_idx);
                    }
                }
                // Also check for # prefixed plain declarations
                for (mi, m) in members.iter().enumerate() {
                    if let ClassMember::NonRune(text) = m {
                        let t = text.trim().trim_end_matches(';').trim();
                        let t_no_hash = t.trim_start_matches('#').trim();
                        if t_no_hash == field_name && !indices_to_remove.contains(&mi) {
                            indices_to_remove.push(mi);
                        }
                    }
                }
                // Remove matching plain declarations (replace with empty NonRune)
                // Also remove preceding JSDoc/comment blocks
                for idx in &indices_to_remove {
                    if *idx < members.len() {
                        members[*idx] = ClassMember::NonRune(String::new());
                        // Remove preceding comment/JSDoc member if it exists
                        if *idx > 0
                            && let ClassMember::NonRune(prev_text) = &members[*idx - 1]
                        {
                            let prev_trimmed = prev_text.trim();
                            if prev_trimmed.starts_with("/*")
                                || prev_trimmed.starts_with("//")
                                || prev_trimmed.starts_with("/**")
                            {
                                members[*idx - 1] = ClassMember::NonRune(String::new());
                            }
                        }
                    }
                }
                fields.push(field);
            }
        }
    }

    if fields.is_empty() {
        return script.to_string();
    }

    // Deconflict private backing names for public fields
    for field in &mut fields {
        if !field.is_private {
            let mut deconflicted = field.private_backing_name.clone();
            while existing_private_ids.contains(&deconflicted) {
                deconflicted = format!("_{}", deconflicted);
            }
            existing_private_ids.push(deconflicted.clone());
            field.private_backing_name = deconflicted;
        }
    }

    // Build transformed class body preserving original member order
    let mut new_class_body = String::new();

    // 1. Emit constructor-declared PUBLIC fields at the top of the class
    // (with getter/setter). Private backing fields come later, just before the constructor.
    // This matches the official Svelte compiler output order.
    for field in &fields {
        if field.constructor_declared && !field.is_private {
            new_class_body.push_str(&emit_class_field(field, &fields));
        }
    }

    // 2. Emit members in original order
    for member in &members {
        match member {
            ClassMember::RuneField(field_idx) => {
                let field = &fields[*field_idx];
                new_class_body.push_str(&emit_class_field(field, &fields));
            }
            ClassMember::NonRune(text) => {
                if text.trim().is_empty() {
                    continue;
                }
                let transformed = transform_class_methods(text, &fields);
                for line in transformed.lines() {
                    new_class_body.push_str(line);
                    new_class_body.push('\n');
                }
            }
            ClassMember::Constructor => {
                // Emit constructor-declared private fields just before the constructor
                for field in &fields {
                    if field.constructor_declared && field.is_private {
                        new_class_body.push_str(&emit_class_field(field, &fields));
                    }
                }
                new_class_body.push('\n');
                new_class_body.push_str(&format!("\t\tconstructor({}) {{\n", constructor_params));

                let mut ctor_body = String::new();
                for line in constructor_content.lines() {
                    let trimmed = line.trim();
                    if trimmed.is_empty() {
                        continue;
                    }

                    let transformed_line = transform_constructor_assignment(trimmed, &fields);
                    ctor_body.push_str(&format!("\t\t\t{}\n", transformed_line));
                }

                let ctor_transformed = transform_class_methods_non_this(&ctor_body, &fields);
                let ctor_transformed =
                    transform_constructor_private_reads(&ctor_transformed, &fields);
                new_class_body.push_str(&ctor_transformed);

                new_class_body.push_str("\t\t}\n");
            }
        }
    }

    // Build the final result
    let before_class = &script[..class_pos];
    let after_class_body = &script[class_body_end + 1..]; // Skip closing brace

    // Recursively process remaining classes in the script
    let after_class_transformed = transform_class_fields_client(after_class_body);

    // Check if this is a `new class ...` expression that needs wrapping
    // `new class Foo { ... }` -> `new (class Foo { ... })()`
    let before_trimmed = before_class.trim_end();
    let is_new_class = before_trimmed.ends_with("new");

    if is_new_class {
        // Trim "new" from before_class and wrap the class in (...)()
        let new_pos = before_class.rfind("new").unwrap();
        let before_new = &before_class[..new_pos];
        format!(
            "{}new ({}\n{}\t}})(){}",
            before_new, class_header, new_class_body, after_class_transformed
        )
    } else {
        format!(
            "{}{}\n{}\t}}{}",
            before_class, class_header, new_class_body, after_class_transformed
        )
    }
}

/// Sanitize a name to be a valid JavaScript identifier.
/// Replaces invalid identifier characters with underscores.
/// For example, "0" becomes "_", "1foo" becomes "_foo".
pub(super) fn sanitize_identifier(name: &str) -> String {
    REGEX_INVALID_IDENTIFIER_CHARS
        .replace_all(name, "_")
        .to_string()
}

/// Format a getter/setter name for class fields.
/// For names that are valid JS identifiers, returns the name as-is.
/// For names that need quoting (contain special chars like hyphens, or are string literals),
/// returns them in quotes. For numeric names, returns them unquoted.
pub(super) fn format_getter_name(name: &str) -> String {
    // If the name is already quoted (starts and ends with quotes), return as-is
    if (name.starts_with('"') && name.ends_with('"'))
        || (name.starts_with('\'') && name.ends_with('\''))
    {
        return name.to_string();
    }
    // If it's a valid identifier as-is, return it
    // Valid identifiers start with a letter, underscore, or $, followed by alphanumerics, _, or $
    if !name.is_empty() {
        let first = name.chars().next().unwrap();
        if (first.is_alphabetic() || first == '_' || first == '$')
            && name
                .chars()
                .all(|c| c.is_alphanumeric() || c == '_' || c == '$')
        {
            return name.to_string();
        }
    }
    // Numeric names are valid property names in JS without quoting
    if name.chars().all(|c| c.is_ascii_digit()) {
        return name.to_string();
    }
    // Otherwise, quote the name
    format!("\"{}\"", name)
}

/// Strip surrounding quotes from a field name if present.
/// For example, `"aria-pressed"` becomes `aria-pressed`.
pub(super) fn strip_field_quotes(name: &str) -> String {
    if (name.starts_with('"') && name.ends_with('"'))
        || (name.starts_with('\'') && name.ends_with('\''))
    {
        name[1..name.len() - 1].to_string()
    } else {
        name.to_string()
    }
}

/// Parse a state field definition.
pub(super) fn parse_state_field(line: &str, rune_type: &str) -> Option<ClassStateField> {
    let trimmed = line.trim().trim_end_matches(';');

    // Check if starts with # (private field)
    let is_private = trimmed.starts_with('#');

    // Find the field name
    let name_end = trimmed.find('=').or_else(|| trimmed.find(" ="))?;
    let name = trimmed[..name_end]
        .trim()
        .trim_start_matches('#')
        .to_string();

    // Find the rune call
    let rune_pattern = format!("{}(", rune_type);
    let rune_start = trimmed.find(&rune_pattern)?;
    let value_start = rune_start + rune_pattern.len();

    // Find matching closing paren
    let after_paren = &trimmed[value_start..];
    let value_end = find_matching_paren(after_paren)?;
    let value = after_paren[..value_end].to_string();

    // Strip quotes from name for private backing name generation
    // e.g., "aria-pressed" -> aria-pressed -> aria_pressed
    let unquoted_name = strip_field_quotes(&name);
    let private_backing_name = sanitize_identifier(&unquoted_name);

    Some(ClassStateField {
        name: name.clone(),
        is_private,
        rune_type: rune_type.to_string(),
        value,
        private_backing_name, // Sanitized to be a valid identifier
        constructor_declared: false,
    })
}

/// Parse a constructor state assignment like `this.name = $state(...)` or `this[n] = $state(...)`.
pub(super) fn parse_constructor_state_assignment(
    line: &str,
    existing_fields: &[ClassStateField],
) -> Option<ClassStateField> {
    let trimmed = line.trim().trim_end_matches(';');

    let (is_private, name) = if trimmed.starts_with("this.") {
        // Handle `this.name = $state(...)` or `this.#name = $state(...)`
        let eq_pos = trimmed.find(" = ")?;
        let field_part = &trimmed[5..eq_pos];
        let is_priv = field_part.starts_with('#');
        let n = field_part.trim_start_matches('#').to_string();
        (is_priv, n)
    } else if trimmed.starts_with("this[") {
        // Handle `this[n] = $state(...)` (bracket notation)
        let bracket_end = trimmed.find(']')?;
        let key = trimmed[5..bracket_end].trim();
        // For bracket notation, the key becomes a quoted property name in getter/setter
        // e.g., this[1] -> get '1'() { ... }
        let unquoted_key = if (key.starts_with('\'') && key.ends_with('\''))
            || (key.starts_with('"') && key.ends_with('"'))
        {
            key[1..key.len() - 1].to_string()
        } else {
            key.to_string()
        };
        // For getter/setter, wrap numeric keys in quotes
        let name = if unquoted_key.chars().all(|c| c.is_ascii_digit()) {
            format!("'{}'", unquoted_key)
        } else {
            unquoted_key
        };
        (false, name)
    } else {
        return None;
    };

    let eq_pos = trimmed.find(" = ")?;
    let rhs = trimmed[eq_pos + 3..].trim();

    let already_exists = existing_fields.iter().any(|f| f.name == name);
    if already_exists {
        return None;
    }
    let (rune_type, value) = if let Some(rest) = rhs.strip_prefix("$state.raw(") {
        let end = find_matching_paren(rest)?;
        ("$state.raw", rest[..end].to_string())
    } else if let Some(rest) = rhs.strip_prefix("$state.frozen(") {
        let end = find_matching_paren(rest)?;
        ("$state.frozen", rest[..end].to_string())
    } else if let Some(rest) = rhs.strip_prefix("$state(") {
        let end = find_matching_paren(rest)?;
        ("$state", rest[..end].to_string())
    } else if let Some(rest) = rhs.strip_prefix("$derived.by(") {
        let end = find_matching_paren(rest)?;
        ("$derived.by", rest[..end].to_string())
    } else if let Some(rest) = rhs.strip_prefix("$derived(") {
        let end = find_matching_paren(rest)?;
        ("$derived", rest[..end].to_string())
    } else {
        return None;
    };
    // Strip quotes from name for private backing name generation
    // e.g., "'1'" -> "1" -> "_" (sanitized)
    let unquoted_name = strip_field_quotes(&name);
    let private_backing_name = sanitize_identifier(&unquoted_name);
    Some(ClassStateField {
        name,
        is_private,
        rune_type: rune_type.to_string(),
        value,
        private_backing_name,
        constructor_declared: true,
    })
}

/// Find all variable prefixes used with a private field in content.
/// For example, for field name "count", finds "this", "self", "instance" etc.
/// from patterns like `this.#count`, `self.#count`, `instance.#count`.
pub(super) fn find_private_field_prefixes(content: &str, field_name: &str) -> Vec<String> {
    let mut prefixes = Vec::new();
    let hash_pattern = format!(".#{}", field_name);

    let mut search_from = 0;
    while let Some(pos) = content[search_from..].find(&hash_pattern) {
        let abs_pos = search_from + pos;
        // Check the character after the field name to ensure it's a word boundary
        let after_pos = abs_pos + hash_pattern.len();
        if after_pos < content.len() {
            let next_char = content.as_bytes()[after_pos] as char;
            if next_char.is_alphanumeric() || next_char == '_' {
                search_from = abs_pos + 1;
                continue;
            }
        }

        // Walk backwards to find the identifier prefix
        if abs_pos > 0 {
            let before = &content[..abs_pos];
            let prefix_end = before.len();
            let mut prefix_start = prefix_end;
            for (i, c) in before.char_indices().rev() {
                if c.is_alphanumeric() || c == '_' || c == '$' {
                    prefix_start = i;
                } else {
                    break;
                }
            }
            if prefix_start < prefix_end {
                let prefix = &before[prefix_start..prefix_end];
                if !prefix.is_empty() && !prefixes.contains(&prefix.to_string()) {
                    prefixes.push(prefix.to_string());
                }
            }
        }
        search_from = abs_pos + 1;
    }

    // Always include "this" if not already present
    if !prefixes.contains(&"this".to_string()) {
        prefixes.push("this".to_string());
    }

    prefixes
}

/// Transform class methods to use $.get() for state field accesses.
///
/// For private state fields (those initialized with $state or $derived),
/// we need to wrap accesses with $.get() and mutations with $.set().
/// Handles any variable prefix (this, self, instance, etc.) not just `this`.
pub(super) fn transform_class_methods(content: &str, fields: &[ClassStateField]) -> String {
    if content.trim().is_empty() || fields.is_empty() {
        return content.to_string();
    }

    let mut result = content.to_string();

    // For each private field, find all prefixes and apply transforms
    for field in fields {
        let prefixes = find_private_field_prefixes(&result, &field.private_backing_name);

        for prefix in &prefixes {
            let qualified = format!("{}.#{}", prefix, field.private_backing_name);

            // First handle assignments (must be done before reads to avoid conflicts)

            // Handle compound assignment operators: +=, -=, *=, /=, %=, **=
            let compound_ops: &[(&str, &str)] = &[
                ("**=", "**"),
                ("+=", "+"),
                ("-=", "-"),
                ("*=", "*"),
                ("/=", "/"),
                ("%=", "%"),
            ];
            for (assign_op, binary_op) in compound_ops {
                let pattern = format!("{} {} ", qualified, assign_op);
                while let Some(pos) = result.find(&pattern) {
                    let value_start = pos + pattern.len();
                    let rest = &result[value_start..];
                    let value_end = rest.find(';').unwrap_or(rest.len());
                    let value = rest[..value_end].trim();
                    let needs_proxy = field.rune_type == "$state" && expression_needs_proxy(value);
                    let replacement = if needs_proxy {
                        format!(
                            "$.set({}, $.get({}) {} {}, true)",
                            qualified, qualified, binary_op, value
                        )
                    } else {
                        format!(
                            "$.set({}, $.get({}) {} {})",
                            qualified, qualified, binary_op, value
                        )
                    };
                    result = format!(
                        "{}{}{}",
                        &result[..pos],
                        replacement,
                        &result[value_start + value_end..]
                    );
                }
            }

            // Handle direct assignment: prefix.#name = value -> $.set(prefix.#name, value)
            let assign_pattern = format!("{} = ", qualified);
            while let Some(pos) = result.find(&assign_pattern) {
                // Check if already inside a $.set() or $.get() call
                let before = &result[..pos];
                if before.ends_with("$.set(") || before.ends_with("$.get(") {
                    break;
                }
                let value_start = pos + assign_pattern.len();
                let rest = &result[value_start..];
                let value_end = rest.find(';').unwrap_or(rest.len());
                let value = rest[..value_end].trim();
                let needs_proxy = field.rune_type == "$state" && expression_needs_proxy(value);
                let replacement = if needs_proxy {
                    format!("$.set({}, {}, true)", qualified, value)
                } else {
                    format!("$.set({}, {})", qualified, value)
                };
                result = format!(
                    "{}{}{}",
                    &result[..pos],
                    replacement,
                    &result[value_start + value_end..]
                );
            }

            // Handle increment: prefix.#name++ or ++prefix.#name
            let post_inc = format!("{}++", qualified);
            while result.contains(&post_inc) {
                let replacement = format!("$.update({})", qualified);
                result = result.replacen(&post_inc, &replacement, 1);
            }
            let pre_inc = format!("++{}", qualified);
            while result.contains(&pre_inc) {
                let replacement = format!("$.update_pre({})", qualified);
                result = result.replacen(&pre_inc, &replacement, 1);
            }

            // Handle decrement: prefix.#name-- or --prefix.#name
            let post_dec = format!("{}--", qualified);
            while result.contains(&post_dec) {
                let replacement = format!("$.update({}, -1)", qualified);
                result = result.replacen(&post_dec, &replacement, 1);
            }
            let pre_dec = format!("--{}", qualified);
            while result.contains(&pre_dec) {
                let replacement = format!("$.update_pre({}, -1)", qualified);
                result = result.replacen(&pre_dec, &replacement, 1);
            }

            // Now handle reads: property access, optional chaining, standalone reads

            // Replace property access patterns: prefix.#name. -> $.get(prefix.#name).
            let property_access_pattern = format!("{}.", qualified);
            let getter_wrapped = format!("$.get({}).", qualified);
            result = result.replace(&property_access_pattern, &getter_wrapped);

            // Replace optional chaining patterns: prefix.#name?. -> $.get(prefix.#name)?.
            let optional_access_pattern = format!("{}?.", qualified);
            let optional_getter_wrapped = format!("$.get({})?.?.", qualified);
            result = result.replace(&optional_access_pattern, &optional_getter_wrapped);

            // Wrap standalone reads of prefix.#name that aren't already wrapped
            // This handles: return prefix.#name; and other standalone uses
            result = wrap_standalone_private_reads(&result, &qualified);
        }
    }

    // Clean up any double wrapping that might have occurred
    result = result.replace("$.get($.get(", "$.get(");
    // Fix optional chaining that got double-wrapped
    result = result.replace("?.?.", "?.");

    result
}

/// Wrap standalone reads of a qualified private field (e.g., `this.#count`)
/// with `$.get()`. Handles patterns like:
/// - `return this.#count;`
/// - `return this.#count`  (without semicolon)
/// - `... this.#count)` (in expressions)
/// - `this.#count,` (in argument lists)
/// - arrow function bodies: `() => this.#count + 1`
pub(super) fn wrap_standalone_private_reads(content: &str, qualified: &str) -> String {
    let mut result = content.to_string();

    // Find all occurrences of the qualified name that aren't already wrapped
    let mut search_from = 0;
    while let Some(pos) = result[search_from..].find(qualified) {
        let abs_pos = search_from + pos;
        let after_pos = abs_pos + qualified.len();

        // Check what comes after - if it's already handled (assignment, increment, property access)
        // or already inside $.get(), $.set(), $.update(), $.update_pre(), skip it
        let before = &result[..abs_pos];
        if before.ends_with("$.get(")
            || before.ends_with("$.set(")
            || before.ends_with("$.update(")
            || before.ends_with("$.update_pre(")
        {
            search_from = after_pos;
            continue;
        }

        // Check character after
        let next_char = if after_pos < result.len() {
            Some(result.as_bytes()[after_pos] as char)
        } else {
            None
        };

        // If followed by = (assignment), ++ or -- (increment/decrement), . (property access),
        // ? (optional chain), or alphanumeric (part of longer name), skip
        match next_char {
            Some('.') | Some('?') | Some('+') | Some('-') => {
                search_from = after_pos;
                continue;
            }
            Some('=') => {
                // Check if it's == (comparison) vs = (assignment)
                if after_pos + 1 < result.len() && result.as_bytes()[after_pos + 1] == b'=' {
                    // It's == or ===, this is a read - wrap it
                } else {
                    // It's an assignment, skip
                    search_from = after_pos;
                    continue;
                }
            }
            Some(c) if c.is_alphanumeric() || c == '_' => {
                search_from = after_pos;
                continue;
            }
            _ => {}
        }

        // This is a standalone read - wrap with $.get()
        let wrapped = format!("$.get({})", qualified);
        result = format!("{}{}{}", &result[..abs_pos], wrapped, &result[after_pos..]);
        search_from = abs_pos + wrapped.len();
    }

    result
}

/// Like `transform_class_methods` but only transforms non-`this` prefixes.
/// Used for constructor bodies where `this.#name` is already handled by
/// `transform_constructor_assignment`, but other prefixes like `instance.#name`
/// or `self.#name` still need to be wrapped with $.get()/$.set().
pub(super) fn transform_class_methods_non_this(
    content: &str,
    fields: &[ClassStateField],
) -> String {
    if content.trim().is_empty() || fields.is_empty() {
        return content.to_string();
    }

    let mut result = content.to_string();

    for field in fields {
        let prefixes = find_private_field_prefixes(&result, &field.private_backing_name);

        for prefix in &prefixes {
            // Skip "this" - it's already handled by transform_constructor_assignment
            if prefix == "this" {
                continue;
            }

            let qualified = format!("{}.#{}", prefix, field.private_backing_name);

            // Handle compound assignments
            let compound_ops: &[(&str, &str)] = &[
                ("**=", "**"),
                ("+=", "+"),
                ("-=", "-"),
                ("*=", "*"),
                ("/=", "/"),
                ("%=", "%"),
            ];
            for (assign_op, binary_op) in compound_ops {
                let pattern = format!("{} {} ", qualified, assign_op);
                while let Some(pos) = result.find(&pattern) {
                    let value_start = pos + pattern.len();
                    let rest = &result[value_start..];
                    let value_end = rest.find(';').unwrap_or(rest.len());
                    let value = rest[..value_end].trim();
                    let replacement = format!(
                        "$.set({}, $.get({}) {} {})",
                        qualified, qualified, binary_op, value
                    );
                    result = format!(
                        "{}{}{}",
                        &result[..pos],
                        replacement,
                        &result[value_start + value_end..]
                    );
                }
            }

            // Handle direct assignment
            let assign_pattern = format!("{} = ", qualified);
            while let Some(pos) = result.find(&assign_pattern) {
                let before = &result[..pos];
                if before.ends_with("$.set(") || before.ends_with("$.get(") {
                    break;
                }
                let value_start = pos + assign_pattern.len();
                let rest = &result[value_start..];
                let value_end = rest.find(';').unwrap_or(rest.len());
                let value = rest[..value_end].trim();
                let replacement = format!("$.set({}, {})", qualified, value);
                result = format!(
                    "{}{}{}",
                    &result[..pos],
                    replacement,
                    &result[value_start + value_end..]
                );
            }

            // Handle increment/decrement
            let post_inc = format!("{}++", qualified);
            while result.contains(&post_inc) {
                result = result.replacen(&post_inc, &format!("$.update({})", qualified), 1);
            }
            let pre_inc = format!("++{}", qualified);
            while result.contains(&pre_inc) {
                result = result.replacen(&pre_inc, &format!("$.update_pre({})", qualified), 1);
            }
            let post_dec = format!("{}--", qualified);
            while result.contains(&post_dec) {
                result = result.replacen(&post_dec, &format!("$.update({}, -1)", qualified), 1);
            }
            let pre_dec = format!("--{}", qualified);
            while result.contains(&pre_dec) {
                result = result.replacen(&pre_dec, &format!("$.update_pre({}, -1)", qualified), 1);
            }

            // Handle reads
            let property_access_pattern = format!("{}.", qualified);
            let getter_wrapped = format!("$.get({}).", qualified);
            result = result.replace(&property_access_pattern, &getter_wrapped);

            let optional_access_pattern = format!("{}?.", qualified);
            let optional_getter_wrapped = format!("$.get({})?.?.", qualified);
            result = result.replace(&optional_access_pattern, &optional_getter_wrapped);

            result = wrap_standalone_private_reads(&result, &qualified);
        }
    }

    // Clean up
    result = result.replace("$.get($.get(", "$.get(");
    result = result.replace("?.?.", "?.");

    result
}

/// Transform constructor assignments for private state fields and rune calls.
pub(super) fn transform_constructor_assignment(line: &str, fields: &[ClassStateField]) -> String {
    let mut result = line.trim().to_string();

    // Handle constructor-declared rune calls
    for field in fields {
        if !field.constructor_declared {
            continue;
        }
        // Build possible this-prefix patterns
        // For regular names: this.name or this.#name
        // For bracket notation (quoted numeric names): this[n]
        let unquoted_name = strip_field_quotes(&field.name);
        let this_prefixes: Vec<String> = if field.is_private {
            vec![format!("this.#{}", field.name)]
        } else if field.name.starts_with('\'') || field.name.starts_with('"') {
            // Quoted name from bracket notation
            vec![
                format!("this[{}]", unquoted_name),
                format!("this['{}']", unquoted_name),
                format!("this[{}]", &field.name),
            ]
        } else {
            vec![format!("this.{}", field.name)]
        };
        let rune_patterns: &[(&str, &str)] = &[
            ("$state.raw(", "$state.raw"),
            ("$state.frozen(", "$state.frozen"),
            ("$state(", "$state"),
            ("$derived.by(", "$derived.by"),
            ("$derived(", "$derived"),
        ];
        for (pattern, rune_type) in rune_patterns {
            let mut matched = false;
            for this_prefix in &this_prefixes {
                let assign_pattern = format!("{} = {}", this_prefix, pattern);
                if result.starts_with(&assign_pattern)
                    || result.trim_end_matches(';').starts_with(&assign_pattern)
                {
                    matched = true;
                    break;
                }
            }
            if matched && let Some(rune_call_start) = result.find(pattern) {
                let value_start = rune_call_start + pattern.len();
                let after_paren = &result[value_start..];
                if let Some(value_end) = find_matching_paren(after_paren) {
                    let value = after_paren[..value_end].to_string();
                    let private_name = format!("this.#{}", field.private_backing_name);
                    let transformed_rhs = match *rune_type {
                        "$state" => {
                            let needs_proxy =
                                !value.trim().is_empty() && expression_needs_proxy(value.trim());
                            if needs_proxy {
                                format!("$.state($.proxy({}))", value)
                            } else {
                                format!("$.state({})", value)
                            }
                        }
                        "$state.raw" | "$state.frozen" => format!("$.state({})", value),
                        "$derived" => {
                            let mut tv = value.clone();
                            for of in fields {
                                let tp = format!("this.#{}", of.private_backing_name);
                                if tv.contains(&tp) {
                                    let getter =
                                        format!("$.get(this.#{})", of.private_backing_name);
                                    tv = tv.replace(&tp, &getter);
                                }
                            }
                            if tv.trim_start().starts_with('{') {
                                format!("$.derived(() => ({}))", tv)
                            } else {
                                format!("$.derived(() => {})", tv)
                            }
                        }
                        "$derived.by" => format!("$.derived({})", value),
                        _ => format!("$.state({})", value),
                    };
                    return format!("{} = {};", private_name, transformed_rhs);
                }
            }
        }
    }

    // Transform $effect.pre -> $.user_pre_effect
    if result.contains("$effect.pre(") {
        result = result.replace("$effect.pre(", "$.user_pre_effect(");
    }

    // Transform $effect -> $.user_effect
    if result.contains("$effect(") {
        result = result.replace("$effect(", "$.user_effect(");
    }

    // Check for private field assignment: this.#name = value
    if result.starts_with("this.#") && result.contains('=') {
        for field in fields {
            if field.is_private {
                // Handle logical assignment operators: ||=, &&=, ??=
                // this.#a ||= {val: 0} -> $.set(this.#a, this.#a.v || { val: 0 }, true);
                let logical_ops = [("||=", "||"), ("&&=", "&&"), ("??=", "??")];
                for (assign_op, binary_op) in logical_ops {
                    let pattern = format!("this.#{} {}", field.name, assign_op);
                    let pattern_nospace = format!("this.#{}{}", field.name, assign_op);

                    if result.starts_with(&pattern) || result.starts_with(&pattern_nospace) {
                        let op_pos = result.find(assign_op).unwrap();
                        let value = result[op_pos + assign_op.len()..]
                            .trim()
                            .trim_end_matches(';');
                        // Use .v to access the value directly for logical operators
                        return format!(
                            "$.set(this.#{}, this.#{}.v {} {}, true);",
                            field.private_backing_name,
                            field.private_backing_name,
                            binary_op,
                            value
                        );
                    }
                }

                // Handle compound assignment operators: +=, -=, *=, /=, %=, **=
                // this.#count *= 2 -> $.set(this.#count, $.get(this.#count) * 2);
                let compound_ops: &[(&str, &str)] = &[
                    ("**=", "**"),
                    ("+=", "+"),
                    ("-=", "-"),
                    ("*=", "*"),
                    ("/=", "/"),
                    ("%=", "%"),
                ];
                for (assign_op, binary_op) in compound_ops {
                    let pattern = format!("this.#{} {} ", field.name, assign_op);
                    let pattern_nospace = format!("this.#{}{}", field.name, assign_op);

                    if result.starts_with(&pattern) || result.starts_with(&pattern_nospace) {
                        let op_pos = result.find(assign_op).unwrap();
                        let value = result[op_pos + assign_op.len()..]
                            .trim()
                            .trim_end_matches(';');
                        return format!(
                            "$.set(this.#{}, $.get(this.#{}) {} {});",
                            field.private_backing_name,
                            field.private_backing_name,
                            binary_op,
                            value
                        );
                    }
                }

                // Handle increment/decrement with $.update()
                let post_inc = format!("this.#{}++", field.name);
                if result.starts_with(&post_inc) {
                    return format!("$.update(this.#{});", field.private_backing_name);
                }
                let pre_inc = format!("++this.#{}", field.name);
                if result.starts_with(&pre_inc) {
                    return format!("$.update_pre(this.#{});", field.private_backing_name);
                }
                let post_dec = format!("this.#{}--", field.name);
                if result.starts_with(&post_dec) {
                    return format!("$.update(this.#{}, -1);", field.private_backing_name);
                }
                let pre_dec = format!("--this.#{}", field.name);
                if result.starts_with(&pre_dec) {
                    return format!("$.update_pre(this.#{}, -1);", field.private_backing_name);
                }

                // Handle regular assignment: this.#name = value
                let pattern = format!("this.#{} =", field.name);
                let pattern_nospace = format!("this.#{}=", field.name);

                if result.starts_with(&pattern) || result.starts_with(&pattern_nospace) {
                    let eq_pos = result.find('=').unwrap();
                    let value = result[eq_pos + 1..].trim().trim_end_matches(';');
                    // Use private_backing_name for the output
                    // Add proxy flag (true) for $state fields when value could be an object
                    // This matches the official compiler's should_proxy() logic
                    let needs_proxy = field.rune_type == "$state" && expression_needs_proxy(value);
                    if needs_proxy {
                        return format!(
                            "$.set(this.#{}, {}, true);",
                            field.private_backing_name, value
                        );
                    } else {
                        return format!("$.set(this.#{}, {});", field.private_backing_name, value);
                    }
                }

                // Handle member access on private state field: this.#name.prop = value
                // -> this.#name.v.prop = value (in constructor, we use .v for direct access)
                // Reference: MemberExpression.js - in constructor for $state fields, use .v
                let member_pattern = format!("this.#{}.", field.name);
                if result.contains(&member_pattern)
                    && (field.rune_type == "$state" || field.rune_type == "$state.raw")
                {
                    let with_v = format!("this.#{}.v.", field.private_backing_name);
                    result = result.replace(&member_pattern, &with_v);
                    return result;
                }
            }
        }
    }

    result
}
