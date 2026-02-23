//! Server-side const tag visitor.

use super::super::ServerCodeGenerator;
use super::super::types::OutputPart;
use crate::ast::template::{ConstTag, TemplateNode};
use crate::compiler::phases::phase3_transform::TransformError;

impl<'a> ServerCodeGenerator<'a> {
    /// Sort const tag nodes topologically based on their dependencies.
    ///
    /// This matches the official Svelte compiler's `sort_const_tags()` in utils.js.
    /// ConstTag nodes that are depended on by others must come first.
    ///
    /// Returns a new list of nodes with const tags sorted, non-const nodes preserved in place.
    pub(crate) fn sort_const_tags_in_nodes<'n>(
        &self,
        nodes: &[&'n TemplateNode],
    ) -> Vec<&'n TemplateNode> {
        // Collect all ConstTag nodes and their info
        let mut const_tag_indices: Vec<usize> = Vec::new();
        let mut const_tags: Vec<&'n ConstTag> = Vec::new();

        for (i, node) in nodes.iter().enumerate() {
            if let TemplateNode::ConstTag(tag) = node {
                const_tag_indices.push(i);
                const_tags.push(tag);
            }
        }

        if const_tags.len() <= 1 {
            // No sorting needed
            return nodes.to_vec();
        }

        // Extract declared names and init expressions for each const tag
        let mut declared_names: Vec<Vec<String>> = Vec::new();
        let mut init_exprs: Vec<String> = Vec::new();

        for tag in &const_tags {
            let start = tag.declaration.start().unwrap_or(0) as usize;
            let end = tag.declaration.end().unwrap_or(0) as usize;
            let decl_src = if end > start && end <= self.source.len() {
                self.source[start..end].trim()
            } else {
                ""
            };

            // Extract variable name(s) before `=` and init expression after `=`
            let (names, init) = if let Some(eq_idx) = find_assignment_eq(decl_src) {
                let lhs = decl_src[..eq_idx].trim();
                let rhs = &decl_src[eq_idx + 1..];
                let names = extract_declared_names(lhs);
                (names, rhs.to_string())
            } else {
                (vec![], String::new())
            };

            declared_names.push(names);
            init_exprs.push(init);
        }

        // Build a map from variable name to const tag index
        let mut name_to_tag: std::collections::HashMap<&str, usize> =
            std::collections::HashMap::new();
        for (i, names) in declared_names.iter().enumerate() {
            for name in names {
                name_to_tag.insert(name.as_str(), i);
            }
        }

        // For each const tag, find which other const tags it depends on
        let n = const_tags.len();
        let mut deps: Vec<Vec<usize>> = vec![Vec::new(); n];

        for (i, init) in init_exprs.iter().enumerate() {
            let idents = extract_identifiers_from_expr(init);
            for ident in &idents {
                if let Some(&dep_idx) = name_to_tag.get(ident.as_str())
                    && dep_idx != i
                {
                    deps[i].push(dep_idx);
                }
            }
        }

        // Topological sort (DFS-based)
        let mut sorted_indices: Vec<usize> = Vec::new();
        let mut visited = vec![false; n];
        let mut visiting = vec![false; n]; // for cycle detection

        fn visit(
            idx: usize,
            deps: &[Vec<usize>],
            visited: &mut Vec<bool>,
            visiting: &mut Vec<bool>,
            sorted: &mut Vec<usize>,
        ) {
            if visited[idx] {
                return;
            }
            if visiting[idx] {
                // Cycle detected - just skip to avoid infinite recursion
                return;
            }
            visiting[idx] = true;
            for &dep in &deps[idx] {
                visit(dep, deps, visited, visiting, sorted);
            }
            visiting[idx] = false;
            visited[idx] = true;
            sorted.push(idx);
        }

        for i in 0..n {
            visit(i, &deps, &mut visited, &mut visiting, &mut sorted_indices);
        }

        // Now build the result: const tags in sorted order, non-const nodes in original order
        // We maintain the constraint that non-const-tag nodes keep their relative positions,
        // but all const tags are sorted and grouped at the beginning.
        //
        // Actually, the official compiler interleaves sorted const tags at their original positions,
        // but since all const tags are "hoisted" in effect (processed before other nodes in the
        // fragment), we can safely output sorted const tags first.
        //
        // However, to minimize changes, we keep the non-const nodes in their original positions
        // and just replace const-tag slots with the sorted order.
        let sorted_const_tags: Vec<&'n TemplateNode> = sorted_indices
            .iter()
            .map(|&idx| nodes[const_tag_indices[idx]])
            .collect();

        let mut result: Vec<&'n TemplateNode> = Vec::with_capacity(nodes.len());
        let mut sorted_iter = sorted_const_tags.iter();

        for node in nodes.iter() {
            if matches!(node, TemplateNode::ConstTag(_)) {
                // Replace with next sorted const tag
                if let Some(sorted_node) = sorted_iter.next() {
                    result.push(sorted_node);
                } else {
                    result.push(node);
                }
            } else {
                result.push(node);
            }
        }

        result
    }

    /// Sort const tag nodes topologically in an owned Vec<TemplateNode>.
    /// This is used by code paths that hold owned nodes (like if_block).
    pub(crate) fn sort_const_tags_owned(&self, nodes: Vec<TemplateNode>) -> Vec<TemplateNode> {
        let refs: Vec<&TemplateNode> = nodes.iter().collect();
        // Count const tags - if 0 or 1, no sorting needed
        let const_count = refs
            .iter()
            .filter(|n| matches!(n, TemplateNode::ConstTag(_)))
            .count();
        if const_count <= 1 {
            return nodes;
        }

        // Get sorted order from the ref-based sort
        let sorted_refs = self.sort_const_tags_in_nodes(&refs);

        // Build the sorted owned vec by matching nodes based on their positions
        // We use the index of each node in the original refs to map to sorted order
        // Since sort_const_tags_in_nodes only reorders ConstTag positions,
        // we can detect which positions changed
        let mut result = Vec::with_capacity(nodes.len());

        // Build a mapping: position in `refs` -> position in `sorted_refs`
        // sorted_refs contains the same references as refs, just in different order for ConstTags
        let ref_ptrs: Vec<*const TemplateNode> = refs.iter().map(|r| *r as *const _).collect();
        let sorted_ptrs: Vec<*const TemplateNode> =
            sorted_refs.iter().map(|r| *r as *const _).collect();

        // For each position in sorted_refs, find the corresponding original index
        let mut used = vec![false; nodes.len()];
        for sorted_ptr in &sorted_ptrs {
            for (orig_idx, &orig_ptr) in ref_ptrs.iter().enumerate() {
                if !used[orig_idx] && orig_ptr == *sorted_ptr {
                    used[orig_idx] = true;
                    result.push(nodes[orig_idx].clone());
                    break;
                }
            }
        }

        if result.len() == nodes.len() {
            result
        } else {
            // Fallback: return original order
            nodes
        }
    }

    pub(crate) fn generate_const_tag(&mut self, tag: &ConstTag) -> Result<(), TransformError> {
        // Get the declaration from the source
        let start = tag.declaration.start().unwrap_or(0) as usize;
        let end = tag.declaration.end().unwrap_or(0) as usize;
        if end > start && end <= self.source.len() {
            let mut declaration_source = self.source[start..end].trim().to_string();

            // Strip TypeScript type annotations from const declarations
            // e.g., `area: number = box.width * box.height` -> `area = box.width * box.height`
            if self.is_typescript && !declaration_source.is_empty() {
                // Wrap as a variable declaration for the TS parser
                let wrapped = format!("const {};", declaration_source);
                let stripped =
                    crate::compiler::phases::phase2_analyze::types::strip_typescript(&wrapped);
                // Unwrap back: remove "const " prefix and ";" suffix
                let stripped = stripped.trim();
                if let Some(rest) = stripped.strip_prefix("const ") {
                    declaration_source = rest.trim_end_matches(';').trim().to_string();
                }
            }

            // Try to extract the variable name and value for constant folding.
            // If the value is a simple literal, add it to constant_vars so subsequent
            // expression tags can fold references to this const.
            if let Some(eq_idx) = declaration_source.find('=') {
                let var_name = declaration_source[..eq_idx].trim();
                let var_value = declaration_source[eq_idx + 1..].trim();

                // Only simple identifiers (no destructuring)
                if var_name
                    .chars()
                    .all(|c| c.is_alphanumeric() || c == '_' || c == '$')
                    && !var_name.is_empty()
                {
                    // Try to evaluate the value using existing constants
                    if let Some(folded) = super::super::helpers::try_evaluate_with_constants(
                        var_value,
                        &self.constant_vars,
                    ) {
                        self.constant_vars.insert(var_name.to_string(), folded);
                    }
                }
            }

            self.output_parts
                .push(OutputPart::ConstDeclaration(declaration_source));
        }
        Ok(())
    }
}

/// Find the index of the assignment `=` in a const tag declaration.
/// Skips past destructuring patterns (handles `{a, b} = expr` and `[a, b] = expr`).
fn find_assignment_eq(decl: &str) -> Option<usize> {
    let chars: Vec<char> = decl.chars().collect();
    let mut depth = 0i32;
    for (i, &c) in chars.iter().enumerate() {
        match c {
            '{' | '[' | '(' => depth += 1,
            '}' | ']' | ')' => depth -= 1,
            '=' if depth == 0 => {
                // Make sure it's not `==` or `=>`
                let next = chars.get(i + 1).copied().unwrap_or('\0');
                if next != '=' && next != '>' {
                    let prev = if i > 0 { chars[i - 1] } else { '\0' };
                    if prev != '!' && prev != '<' && prev != '>' {
                        return Some(i);
                    }
                }
            }
            _ => {}
        }
    }
    None
}

/// Extract declared variable names from a destructuring pattern or simple identifier.
/// Returns a list of identifier names declared by the LHS of a const tag declaration.
fn extract_declared_names(lhs: &str) -> Vec<String> {
    let mut names = Vec::new();
    // Handle simple identifier
    let trimmed = lhs.trim();
    if trimmed
        .chars()
        .all(|c| c.is_alphanumeric() || c == '_' || c == '$')
        && !trimmed.is_empty()
    {
        names.push(trimmed.to_string());
        return names;
    }
    // Handle destructuring patterns: extract identifiers
    for ident in extract_identifiers_from_expr(lhs) {
        names.push(ident);
    }
    names
}

/// Extract all identifier names referenced in an expression string.
/// Uses a simple lexer approach to find word-boundary identifiers.
fn extract_identifiers_from_expr(expr: &str) -> Vec<String> {
    let mut idents = Vec::new();
    let chars: Vec<char> = expr.chars().collect();
    let len = chars.len();
    let mut i = 0;
    let mut in_string = false;
    let mut string_char = ' ';

    while i < len {
        let c = chars[i];

        // String tracking
        if c == '\'' || c == '"' || c == '`' {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char && (i == 0 || chars[i - 1] != '\\') {
                in_string = false;
            }
            i += 1;
            continue;
        }
        if in_string {
            i += 1;
            continue;
        }

        // Check for identifier start
        if c.is_alphabetic() || c == '_' || c == '$' {
            let start = i;
            while i < len && (chars[i].is_alphanumeric() || chars[i] == '_' || chars[i] == '$') {
                i += 1;
            }
            let ident: String = chars[start..i].iter().collect();
            // Skip keywords
            if !is_js_keyword(&ident) {
                idents.push(ident);
            }
        } else {
            i += 1;
        }
    }

    idents
}

/// Check if a string is a JavaScript keyword (not an identifier reference).
fn is_js_keyword(s: &str) -> bool {
    matches!(
        s,
        "true"
            | "false"
            | "null"
            | "undefined"
            | "this"
            | "new"
            | "typeof"
            | "instanceof"
            | "void"
            | "delete"
            | "in"
            | "of"
            | "let"
            | "const"
            | "var"
            | "function"
            | "class"
            | "return"
            | "if"
            | "else"
            | "for"
            | "while"
            | "do"
            | "switch"
            | "case"
            | "break"
            | "continue"
            | "throw"
            | "try"
            | "catch"
            | "finally"
            | "import"
            | "export"
            | "default"
            | "async"
            | "await"
            | "yield"
            | "from"
            | "as"
    )
}
