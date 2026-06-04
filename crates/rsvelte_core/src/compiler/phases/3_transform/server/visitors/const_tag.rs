//! Server-side const tag visitor.

use super::super::ServerCodeGenerator;
use super::super::types::OutputPart;
use crate::ast::template::{ConstTag, DeclarationTag, TemplateNode};
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
        let mut name_to_tag: rustc_hash::FxHashMap<&str, usize> = rustc_hash::FxHashMap::default();
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
            if self.is_typescript && !declaration_source.is_empty() {
                let wrapped = format!("const {};", declaration_source);
                let stripped =
                    crate::compiler::phases::phase2_analyze::types::strip_typescript(&wrapped);
                let stripped = stripped.trim();
                if let Some(rest) = stripped.strip_prefix("const ") {
                    declaration_source = rest.trim_end_matches(';').trim().to_string();
                }
            }

            let has_await = tag.metadata.expression.has_await();

            // Extract variable names and init expression
            let (lhs, rhs) = if let Some(eq_idx) = find_assignment_eq(&declaration_source) {
                let rhs_raw = declaration_source[eq_idx + 1..].trim().to_string();
                // Transform store subscriptions in the init expression
                let rhs_transformed = self.transform_store_refs(&rhs_raw);
                (
                    declaration_source[..eq_idx].trim().to_string(),
                    rhs_transformed,
                )
            } else {
                (declaration_source.clone(), String::new())
            };

            // Extract all declared variable names
            let declared_names = extract_declared_names(&lhs);

            // Check if any referenced variables have const-level blockers
            // Only consider blockers from DIFFERENT async_consts groups.
            // Dependencies within the same group are handled implicitly by
            // sequential execution in $$renderer.run().
            let init_refs = extract_identifiers_from_expr(&rhs);
            let current_group_name = self.async_consts.as_ref().map(|g| g.name.clone());
            let blockers: Vec<String> = {
                let const_blocker_map = self.const_blocker_map.borrow();
                let mut blist = Vec::new();
                for name in &init_refs {
                    if let Some(blocker_expr) = const_blocker_map.get(name) {
                        // Skip blockers from the current group (same promises array)
                        if let Some(ref group_name) = current_group_name
                            && blocker_expr.starts_with(&format!("{}[", group_name))
                        {
                            continue;
                        }
                        if !blist.contains(blocker_expr) {
                            blist.push(blocker_expr.clone());
                        }
                    } else if let Some(&idx) = self.top_level_blocker_map.get(name) {
                        // Top-level `$$promises[N]` blocker (instance-script
                        // binding assigned inside the async-body grouping).
                        // Mirrors upstream's `dep.blocker` lookup on
                        // `Binding.blocker` for instance-level bindings.
                        let blocker_expr = format!("$$promises[{}]", idx);
                        if !blist.contains(&blocker_expr) {
                            blist.push(blocker_expr);
                        }
                    }
                }
                blist
            };

            let has_blockers = !blockers.is_empty();
            let async_consts_active = self.async_consts.is_some();

            // Match the official Svelte compiler condition:
            // if (has_await || context.state.async_consts || blockers.length > 0)
            if has_await || async_consts_active || has_blockers {
                // Create or reuse the async_consts group
                if self.async_consts.is_none() {
                    let group_name = self.generate_promises_name();
                    self.async_consts = Some(super::super::AsyncConstsGroup {
                        name: group_name,
                        thunks: Vec::new(),
                        declared_vars: Vec::new(),
                    });
                }

                // Emit `let varname;` for each declared variable
                for name in &declared_names {
                    self.output_parts
                        .push(OutputPart::RawStatement(format!("let {};", name)));
                }

                let group = self.async_consts.as_mut().unwrap();

                // Add blocker wait thunks
                if blockers.len() == 1 {
                    group.thunks.push((format!("() => {}", blockers[0]), false));
                } else if blockers.len() > 1 {
                    group.thunks.push((
                        format!("() => Promise.all([{}])", blockers.join(", ")),
                        false,
                    ));
                }

                // Add the assignment thunk
                let is_destructuring = lhs.starts_with('{') || lhs.starts_with('[');
                // Re-indent multiline rhs so inner lines align properly with the thunk body.
                // Source-level indentation may differ from the thunk's context indentation.
                let normalize_rhs = |rhs: &str| -> String {
                    if !rhs.contains('\n') {
                        return rhs.to_string();
                    }
                    let lines: Vec<&str> = rhs.lines().collect();
                    if lines.len() <= 1 {
                        return rhs.to_string();
                    }
                    // Find minimum indentation of non-first, non-empty lines
                    let min_indent = lines[1..]
                        .iter()
                        .filter(|l| !l.trim().is_empty())
                        .map(|l| l.len() - l.trim_start().len())
                        .min()
                        .unwrap_or(0);
                    // Rebuild: first line as-is, subsequent lines re-indented to 2 tabs
                    let mut result = lines[0].to_string();
                    for line in &lines[1..] {
                        result.push('\n');
                        if line.trim().is_empty() {
                            continue;
                        }
                        let stripped = if min_indent <= line.len() {
                            &line[min_indent..]
                        } else {
                            line.trim()
                        };
                        result.push_str("\t\t");
                        result.push_str(stripped);
                    }
                    result
                };
                // Match the official Svelte compiler (5.55.3+): emit an
                // expression-bodied arrow function for the assignment thunk
                // (e.g. `async () => x = (await $.save(rhs))()` or
                // `() => x = rhs`) instead of a block-bodied one. The wait
                // thunk for blockers (if any) is a separate entry in
                // `run.thunks` and was already pushed before this point.
                let thunk_code = if has_await {
                    let save_wrapped = super::super::helpers::transform_await_to_save(&rhs);
                    let save_wrapped = normalize_rhs(&save_wrapped);
                    if is_destructuring {
                        format!("async () => ({} = {})", lhs, save_wrapped)
                    } else {
                        format!("async () => {} = {}", lhs, save_wrapped)
                    }
                } else if is_destructuring {
                    let normalized_rhs = normalize_rhs(&rhs);
                    format!("() => ({} = {})", lhs, normalized_rhs)
                } else {
                    let normalized_rhs = normalize_rhs(&rhs);
                    format!("() => {} = {}", lhs, normalized_rhs)
                };
                let thunk_index = group.thunks.len();
                group.thunks.push((thunk_code, has_await));

                // Track declared vars for blocker registration when flushed
                let group_name = group.name.clone();
                for name in &declared_names {
                    group.declared_vars.push((name.clone(), thunk_index));
                    // Immediately populate const_blocker_map so that snippet body generators
                    // (which share the same Rc<RefCell>) can see parent-scope blockers even
                    // before flush_async_consts is called.
                    let blocker_expr = format!("{}[{}]", group_name, thunk_index);
                    self.const_blocker_map
                        .borrow_mut()
                        .insert(name.clone(), blocker_expr);
                }
            } else {
                // Simple (sync) const declaration

                // Try to extract the variable name and value for constant folding.
                if !rhs.is_empty()
                    && !lhs.is_empty()
                    && lhs
                        .chars()
                        .all(|c| c.is_alphanumeric() || c == '_' || c == '$')
                    && let Some(folded) = super::super::helpers::try_evaluate_with_constants(
                        &rhs,
                        &self.constant_vars,
                    )
                {
                    self.constant_vars.insert(lhs.clone(), folded);
                }

                // Transform store subscriptions ($store -> $.store_get())
                let declaration_source = self.transform_store_refs(&declaration_source);
                self.output_parts
                    .push(OutputPart::ConstDeclaration(declaration_source));
            }
        }
        Ok(())
    }

    /// Generate a `{let x = …}` / `{const x = …}` declaration tag
    /// (Svelte 5.56.0 #18282) on the server side. Mirrors `generate_const_tag`
    /// for the synchronous path but preserves the `let` / `const` keyword that
    /// the user wrote: the source slice already includes the keyword.
    ///
    /// The asynchronous path (`metadata.expression.has_await` /
    /// `async_consts` active) is intentionally not threaded through the
    /// `$$renderer.run([...])` lowering yet — the corresponding
    /// `async-declaration-tag*` fixtures continue to fail until that work
    /// lands, so the synchronous case can ship independently.
    pub(crate) fn generate_declaration_tag(
        &mut self,
        tag: &DeclarationTag,
    ) -> Result<(), TransformError> {
        let start = tag.start as usize;
        let end = tag.end as usize;
        if start >= end || end > self.source.len() {
            return Ok(());
        }
        let raw = &self.source[start..end];
        // Strip the surrounding `{` and `}` so the rune transformer sees a
        // clean `let x = $state(1)` / `const y = …` statement.
        let body = raw
            .strip_prefix('{')
            .and_then(|s| s.strip_suffix('}'))
            .unwrap_or(raw)
            .trim();
        if body.is_empty() {
            return Ok(());
        }
        let mut script_input = String::with_capacity(body.len() + 2);
        script_input.push_str(body);
        if !body.ends_with(';') {
            script_input.push(';');
        }
        script_input.push('\n');

        // Run through the same server-side rune-rewrite pipeline used for the
        // instance script so `$state(v)` is stripped to `v`, `$derived(expr)`
        // becomes `$.derived(() => expr)`, etc.
        let imported_names = rustc_hash::FxHashSet::default();
        // Seed the component's derived binding names so a read of a `$derived`
        // declared in *another* declaration tag (`{let d = $derived(…)}` then
        // `{let e = $derived(d * 2)}`) is wrapped to the server callable form
        // `d()` (Svelte 5.56.1 #18348).
        let transformed =
            crate::compiler::phases::phase3_transform::server::transform_script::transform_script_content_with_imports_and_derived(
                &script_input,
                &imported_names,
                &self.derived_names,
                self.dev,
            );

        let trimmed = transformed.trim();
        if trimmed.is_empty() {
            return Ok(());
        }
        // Emit the rewritten declaration as a raw statement so the original
        // `let` / `const` keyword (and trailing `;`) emitted by the rune
        // pipeline survives verbatim. Routing through
        // `OutputPart::ConstDeclaration` would prepend `const ` to the
        // already-prefixed line, producing `const let x = ...;` — wrong.
        let stmt = if trimmed.ends_with(';') {
            trimmed.to_string()
        } else {
            format!("{};", trimmed)
        };

        // Decide sync vs async from the LOWERED declaration. An awaited or
        // blocked initializer (`{let x = $state(await …)}` /
        // `{const y = $derived(await …)}` / `{let z = $state(awaited_binding)}`)
        // is lowered to a bare `let name;` plus an assignment thunk collected
        // into `self.async_consts` (emitted `var promises_N =
        // $$renderer.run([…])`), with blocker-wait thunks — mirroring the
        // ConstTag async path (`generate_const_tag`).
        let has_await = tag.metadata.expression.has_await();
        let body_no_semi = stmt.trim_end().trim_end_matches(';').trim();
        let after_kw = body_no_semi
            .strip_prefix("let ")
            .or_else(|| body_no_semi.strip_prefix("const "))
            .or_else(|| body_no_semi.strip_prefix("var "))
            .unwrap_or(body_no_semi)
            .trim();
        if let Some(eq_idx) = find_assignment_eq(after_kw) {
            let lhs = after_kw[..eq_idx].trim().to_string();
            let rhs = after_kw[eq_idx + 1..].trim().to_string();
            let init_refs = extract_identifiers_from_expr(&rhs);
            let blockers = self.compute_decl_tag_blockers(&init_refs);
            if has_await || !blockers.is_empty() {
                let declared_names = extract_declared_names(&lhs);
                self.emit_async_decl_tag(&declared_names, &lhs, &rhs, has_await, &blockers);
                return Ok(());
            }
        }

        // Synchronous path: emit the rewritten declaration verbatim (preserving
        // the user's `let`/`const` keyword).
        self.output_parts.push(OutputPart::RawStatement(stmt));

        // Populate `constant_vars` for foldable literal declarators so reads of
        // the binding constant-fold to the literal in template expressions
        // (mirrors `generate_const_tag` + upstream `scope.evaluate`). Reactive
        // initializers (`$state(…)` / `$derived(…)`) don't fold, so they're
        // left out and continue to read via their runtime form.
        let decl_json = tag.declaration.as_json();
        if let Some(decls) = decl_json.get("declarations").and_then(|d| d.as_array()) {
            for d in decls {
                let (Some(id), Some(init)) = (d.get("id"), d.get("init")) else {
                    continue;
                };
                if init.is_null() || id.get("type").and_then(|t| t.as_str()) != Some("Identifier") {
                    continue;
                }
                let Some(name) = id.get("name").and_then(|n| n.as_str()) else {
                    continue;
                };
                let (Some(s), Some(e)) = (
                    init.get("start").and_then(|v| v.as_u64()),
                    init.get("end").and_then(|v| v.as_u64()),
                ) else {
                    continue;
                };
                let (s, e) = (s as usize, e as usize);
                if s >= e || e > self.source.len() {
                    continue;
                }
                let rhs = self.source[s..e].trim();
                if let Some(folded) =
                    super::super::helpers::try_evaluate_with_constants(rhs, &self.constant_vars)
                {
                    self.constant_vars.insert(name.to_string(), folded);
                }
            }
        }
        Ok(())
    }

    /// Compute the cross-group async blockers for a DeclarationTag whose
    /// initializer references `init_refs`. Mirrors the blocker computation in
    /// `generate_const_tag`: a referenced binding registered in
    /// `const_blocker_map` (a different async_consts group) or in the
    /// instance-level `top_level_blocker_map` (`$$promises[N]`) contributes a
    /// wait expression. Blockers within the current group are skipped (they are
    /// ordered implicitly by sequential `$$renderer.run` execution).
    fn compute_decl_tag_blockers(&self, init_refs: &[String]) -> Vec<String> {
        let current_group_name = self.async_consts.as_ref().map(|g| g.name.clone());
        let const_blocker_map = self.const_blocker_map.borrow();
        let mut blist: Vec<String> = Vec::new();
        for name in init_refs {
            if let Some(blocker_expr) = const_blocker_map.get(name) {
                if let Some(ref group_name) = current_group_name
                    && blocker_expr.starts_with(&format!("{}[", group_name))
                {
                    continue;
                }
                if !blist.contains(blocker_expr) {
                    blist.push(blocker_expr.clone());
                }
            } else if let Some(&idx) = self.top_level_blocker_map.get(name) {
                let blocker_expr = format!("$$promises[{}]", idx);
                if !blist.contains(&blocker_expr) {
                    blist.push(blocker_expr);
                }
            }
        }
        blist
    }

    /// Emit a DeclarationTag through the async-declaration lowering: a bare
    /// `let name;` for each declared binding, blocker-wait thunk(s), and the
    /// deferred assignment thunk, all collected into `self.async_consts` (which
    /// `flush_async_consts` renders as `var promises_N = $$renderer.run([…])`).
    /// Registers each binding's blocker in `const_blocker_map` so downstream
    /// reactive reads wrap in `$$renderer.async([promises_N[i]], …)`. Mirrors
    /// the async branch of `generate_const_tag`.
    fn emit_async_decl_tag(
        &mut self,
        declared_names: &[String],
        lhs: &str,
        rhs: &str,
        has_await: bool,
        blockers: &[String],
    ) {
        if self.async_consts.is_none() {
            let group_name = self.generate_promises_name();
            self.async_consts = Some(super::super::AsyncConstsGroup {
                name: group_name,
                thunks: Vec::new(),
                declared_vars: Vec::new(),
            });
        }

        for name in declared_names {
            self.output_parts
                .push(OutputPart::RawStatement(format!("let {};", name)));
        }

        let group = self.async_consts.as_mut().unwrap();

        if blockers.len() == 1 {
            group.thunks.push((format!("() => {}", blockers[0]), false));
        } else if blockers.len() > 1 {
            group.thunks.push((
                format!("() => Promise.all([{}])", blockers.join(", ")),
                false,
            ));
        }

        let is_destructuring = lhs.starts_with('{') || lhs.starts_with('[');
        // Re-indent multiline rhs so inner lines align with the thunk body.
        let normalize_rhs = |rhs: &str| -> String {
            if !rhs.contains('\n') {
                return rhs.to_string();
            }
            let lines: Vec<&str> = rhs.lines().collect();
            if lines.len() <= 1 {
                return rhs.to_string();
            }
            let min_indent = lines[1..]
                .iter()
                .filter(|l| !l.trim().is_empty())
                .map(|l| l.len() - l.trim_start().len())
                .min()
                .unwrap_or(0);
            let mut result = lines[0].to_string();
            for line in &lines[1..] {
                result.push('\n');
                if line.trim().is_empty() {
                    continue;
                }
                let stripped = if min_indent <= line.len() {
                    &line[min_indent..]
                } else {
                    line.trim()
                };
                result.push_str("\t\t");
                result.push_str(stripped);
            }
            result
        };

        let thunk_code = if has_await {
            let save_wrapped = super::super::helpers::transform_await_to_save(rhs);
            let save_wrapped = normalize_rhs(&save_wrapped);
            if is_destructuring {
                format!("async () => ({} = {})", lhs, save_wrapped)
            } else {
                format!("async () => {} = {}", lhs, save_wrapped)
            }
        } else if is_destructuring {
            format!("() => ({} = {})", lhs, normalize_rhs(rhs))
        } else {
            format!("() => {} = {}", lhs, normalize_rhs(rhs))
        };
        let thunk_index = group.thunks.len();
        group.thunks.push((thunk_code, has_await));

        let group_name = group.name.clone();
        for name in declared_names {
            group.declared_vars.push((name.clone(), thunk_index));
            let blocker_expr = format!("{}[{}]", group_name, thunk_index);
            self.const_blocker_map
                .borrow_mut()
                .insert(name.clone(), blocker_expr);
        }
    }

    /// Flush accumulated async const tags into a single `$$renderer.run([...])` call.
    /// This should be called after processing all nodes in a fragment.
    pub(crate) fn flush_async_consts(&mut self) {
        if let Some(group) = self.async_consts.take() {
            if group.thunks.is_empty() {
                return;
            }

            // Build the thunks array string
            let thunks_str = group
                .thunks
                .iter()
                .map(|(code, _)| code.as_str())
                .collect::<Vec<_>>()
                .join(",\n\n\t");

            // Emit: var promises_N = $$renderer.run([thunks...])
            self.output_parts.push(OutputPart::RawStatement(format!(
                "var {} = $$renderer.run([\n\t{}\n]);",
                group.name, thunks_str
            )));

            // Register blockers for declared variables and emit metadata part
            let mut blocker_entries = Vec::new();
            {
                let mut const_blocker_map = self.const_blocker_map.borrow_mut();
                for (name, thunk_index) in &group.declared_vars {
                    let blocker_expr = format!("{}[{}]", group.name, thunk_index);
                    const_blocker_map.insert(name.clone(), blocker_expr.clone());
                    blocker_entries.push((name.clone(), blocker_expr));
                }
            }
            // Emit a metadata part so apply_const_async_wrapping can build scoped blocker maps
            self.output_parts
                .push(OutputPart::ConstBlockerMetadata { blocker_entries });
        }
    }

    /// Generate a unique promises group name for async const tags.
    fn generate_promises_name(&mut self) -> String {
        let counter = self.const_promises_counter.get();
        let name = if counter == 0 {
            "promises".to_string()
        } else {
            format!("promises_{}", counter)
        };
        self.const_promises_counter.set(counter + 1);
        name
    }
}

/// Find the index of the assignment `=` in a const tag declaration.
/// Skips past destructuring patterns (handles `{a, b} = expr` and `[a, b] = expr`).
fn find_assignment_eq(decl: &str) -> Option<usize> {
    // Scan bytes (not chars) and return a BYTE index: the result is used to slice
    // the UTF-8 string, so a `Vec<char>` index would corrupt a `{@const}` whose
    // LHS contains a multi-byte character (H-131). All tokens matched here
    // (`{[(}])`, `=`, `!`, `<`, `>`) are ASCII, so byte scanning is exact.
    let bytes = decl.as_bytes();
    let mut depth = 0i32;
    let mut i = 0;
    while i < bytes.len() {
        match bytes[i] {
            b'{' | b'[' | b'(' => depth += 1,
            b'}' | b']' | b')' => depth -= 1,
            b'=' if depth == 0 => {
                // Make sure it's not `==` or `=>`
                let next = bytes.get(i + 1).copied().unwrap_or(0);
                if next != b'=' && next != b'>' {
                    let prev = if i > 0 { bytes[i - 1] } else { 0 };
                    if prev != b'!' && prev != b'<' && prev != b'>' {
                        return Some(i);
                    }
                }
            }
            _ => {}
        }
        i += 1;
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
