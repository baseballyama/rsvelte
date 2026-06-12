//! Server-side if block visitor.

use super::super::ServerCodeGenerator;
use super::super::types::OutputPart;
use crate::ast::template::{Fragment, IfBlock, TemplateNode};
use crate::compiler::phases::phase3_transform::TransformError;
use crate::compiler::phases::phase3_transform::utils::{
    is_svelte_whitespace_only, svelte_trim_end, svelte_trim_start,
};

impl<'a> ServerCodeGenerator<'a> {
    /// Compute the set of blocker "identity" strings for a test expression.
    ///
    /// Walks identifiers in the test expression and looks them up in
    /// `top_level_blocker_map` (`$$promises[N]`) and `const_blocker_map`
    /// (`promises[N]` / `promises_K[N]`). The returned set is used to compare
    /// blocker sets between adjacent `{:else if}` branches when deciding
    /// whether to flatten them. Mirrors upstream's
    /// `ExpressionMetadata.has_more_blockers_than` (Svelte 5.55.3 `3937ec03b`).
    pub(crate) fn collect_blocker_identity_set(
        &self,
        test_expr: &str,
    ) -> std::collections::BTreeSet<String> {
        let mut set = std::collections::BTreeSet::new();
        let top_level = &self.top_level_blocker_map;
        let const_map = self.const_blocker_map.borrow();
        let bytes = test_expr.as_bytes();
        let len = bytes.len();
        let mut i = 0;
        while i < len {
            let ch = bytes[i];
            if ch.is_ascii_alphabetic() || ch == b'_' || ch == b'$' {
                let start = i;
                while i < len
                    && (bytes[i].is_ascii_alphanumeric() || bytes[i] == b'_' || bytes[i] == b'$')
                {
                    i += 1;
                }
                let ident = &test_expr[start..i];
                if start > 0 && bytes[start - 1] == b'.' {
                    continue;
                }
                if let Some(&idx) = top_level.get(ident) {
                    set.insert(format!("$$promises[{}]", idx));
                }
                if let Some(blocker_str) = const_map.get(ident) {
                    set.insert(blocker_str.clone());
                }
                continue;
            }
            i += 1;
        }
        set
    }

    pub(crate) fn generate_if_block(&mut self, block: &IfBlock) -> Result<(), TransformError> {
        // Get the test expression from the source
        let start = block.test.start().unwrap_or(0) as usize;
        let end = block.test.end().unwrap_or(0) as usize;
        let test_expr = if end > start && end <= self.source.len() {
            self.source[start..end].trim().to_string()
        } else {
            "false".to_string()
        };

        // Transform store subscriptions ($store -> $.store_get())
        let test_expr = self.transform_store_refs(&test_expr);
        // Transform special legacy variables ($$props -> $$sanitized_props)
        let test_expr = self.transform_special_vars(&test_expr);
        // Collapse SSR-only rune calls (`$effect.pending()` → `0`,
        // `$effect.tracking()` → `false`, `$state.snapshot(x)` → `$.snapshot(x)`,
        // `$state.eager(x)` → `x`) in the test expression. Upstream's IfBlock
        // visitor walks `node.test` through the per-`CallExpression` visitor,
        // so `{#if $effect.pending() > 0}` becomes `if (0 > 0) { ... }`.
        // rsvelte pulls the test as raw source, so we run the same AST-based
        // pass here.
        let test_expr = Self::transform_rune_in_template_expr(&test_expr);

        // Snapshot the const_blocker_map entries present BEFORE this if-block
        // so we can undo any SHADOW the branch introduces. The shared
        // `const_blocker_map` is name-keyed; a block-local
        // `{let name = $state(await …)}` registers `name -> promises_N[i]`,
        // overwriting an OUTER same-named binding's blocker. After both
        // branches are generated we re-assert the original value for every
        // pre-existing key so the outer read (e.g. the root `{name}`) still
        // resolves to the outer blocker. Keys the branch newly introduces
        // (block-local consts consumed at the build root) are LEFT IN PLACE —
        // a blanket remove would regress fixtures whose if-block `{@const}` /
        // `$derived` consts are wrapped at the build wrapper level.
        let cbm_before: rustc_hash::FxHashMap<String, String> =
            self.const_blocker_map.borrow().clone();

        // Generate consequent body parts
        let consequent_body = self.generate_if_branch_body(&block.consequent, None)?;

        // Compute blocker identity set for this test so the alternate-branch
        // visitor can suppress flattening of an `{:else if}` whose test has
        // blockers not in our set.
        let parent_blockers = self.collect_blocker_identity_set(&test_expr);

        // Generate alternate body parts if present
        let alternate_body = if let Some(ref alternate) = block.alternate {
            Some(self.generate_if_branch_body(alternate, Some(&parent_blockers))?)
        } else {
            None
        };

        // Undo shadows: restore the ORIGINAL value for every key that existed
        // before this if-block (fires AFTER both branches so nested
        // `collect_blocker_identity_set` reads still saw the live entries).
        {
            let mut cbm = self.const_blocker_map.borrow_mut();
            for (k, v) in &cbm_before {
                cbm.insert(k.clone(), v.clone());
            }
        }

        self.output_parts.push(OutputPart::IfBlock {
            test_expr,
            consequent_body,
            alternate_body,
            is_elseif: block.elseif,
        });

        Ok(())
    }

    /// Generate body parts for an if/else branch, handling nested IfBlocks for else-if chains.
    ///
    /// `parent_blockers`, when `Some`, is the blocker-identity set of the
    /// enclosing IfBlock's test. If a candidate `{:else if}` has blockers
    /// (`top_level_blocker_map` / `const_blocker_map`) that the parent does
    /// not have, we refuse to flatten so the else-if becomes its own IfBlock
    /// and gets its own `async_block(...)` wrapper. Mirrors upstream's
    /// `has_more_blockers_than` check in `2-analyze/visitors/IfBlock.js`
    /// (Svelte 5.55.3 `3937ec03b`).
    pub(crate) fn generate_if_branch_body(
        &mut self,
        fragment: &Fragment,
        parent_blockers: Option<&std::collections::BTreeSet<String>>,
    ) -> Result<Vec<OutputPart>, TransformError> {
        // Check if this fragment contains only a single IfBlock (else-if case)
        let nodes: Vec<_> = fragment.nodes.iter().collect();

        // Filter out whitespace-only text nodes
        let meaningful_nodes: Vec<_> = nodes
            .iter()
            .filter(|n| {
                if let TemplateNode::Text(text) = n {
                    !is_svelte_whitespace_only(&text.data)
                } else {
                    true
                }
            })
            .collect();

        // Whether we suppressed elseif-flattening due to a blocker mismatch.
        // When true, we fall through to the standard child-node processing but
        // mark the resulting top-level IfBlock with `is_elseif: false` so the
        // codegen layer (`build_parts_with_store_subs`) does not re-flatten
        // it. Mirrors upstream `has_more_blockers_than` (Svelte 5.55.3
        // `3937ec03b`): an `{:else if}` whose test introduces blockers the
        // outer doesn't share becomes its own IfBlock so
        // `apply_async_wrapping` / `apply_const_async_wrapping` can give it
        // its own `async_block(...)` shell.
        let mut suppress_elseif_flag_on_output = false;

        // If there's exactly one node and it's an IfBlock with elseif=true, this is an else-if chain.
        // When elseif=false, it's a separate {#if} block nested inside {:else}, not a chain.
        // Don't flatten if the else-if has an await expression - it needs its own async block.
        if meaningful_nodes.len() == 1
            && let TemplateNode::IfBlock(nested_if) = meaningful_nodes[0]
            && nested_if.elseif
            && !nested_if.metadata.expression.has_await()
        {
            // For else-if, we return a nested IfBlock OutputPart directly
            let nested_test_start = nested_if.test.start().unwrap_or(0) as usize;
            let nested_test_end = nested_if.test.end().unwrap_or(0) as usize;
            let nested_test_expr =
                if nested_test_end > nested_test_start && nested_test_end <= self.source.len() {
                    self.source[nested_test_start..nested_test_end]
                        .trim()
                        .to_string()
                } else {
                    "false".to_string()
                };
            let nested_test_expr = self.transform_store_refs(&nested_test_expr);
            let nested_test_expr = self.transform_special_vars(&nested_test_expr);
            let nested_test_expr = Self::transform_rune_in_template_expr(&nested_test_expr);

            // Don't flatten when the else-if's test introduces blockers the
            // parent doesn't share — fall through to the standard path which
            // will visit the nested IfBlock as a regular child node, letting
            // `apply_async_wrapping` give it its own `async_block(...)` shell.
            let nested_blockers = self.collect_blocker_identity_set(&nested_test_expr);
            let parent_has_all = parent_blockers
                .map(|p| nested_blockers.iter().all(|b| p.contains(b)))
                .unwrap_or(true);
            if !parent_has_all {
                suppress_elseif_flag_on_output = true;
                // Fall through to standard processing.
            } else {
                let nested_consequent =
                    self.generate_if_branch_body(&nested_if.consequent, None)?;
                let parent_for_nested = self.collect_blocker_identity_set(&nested_test_expr);
                let nested_alternate = if let Some(ref alt) = nested_if.alternate {
                    Some(self.generate_if_branch_body(alt, Some(&parent_for_nested))?)
                } else {
                    None
                };

                return Ok(vec![OutputPart::IfBlock {
                    test_expr: nested_test_expr,
                    consequent_body: nested_consequent,
                    alternate_body: nested_alternate,
                    is_elseif: true,
                }]);
            }
        }

        // Standard case: generate body parts for the branch
        let len = nodes.len();
        let mut start_idx = 0;
        let mut end_idx = len;

        // When preserve_whitespace is active (e.g. inside a <pre> or <textarea>),
        // skip ALL the whitespace-collapsing and trimming passes — upstream's
        // clean_nodes returns the nodes verbatim when preserve_whitespace=true.
        // Only strip Comment nodes (unless preserveComments) and sort ConstTags.
        let preserve_whitespace = self.preserve_whitespace;

        if !preserve_whitespace {
            // Skip leading whitespace and comments (comments don't produce output)
            while start_idx < len {
                match nodes[start_idx] {
                    TemplateNode::Text(text) if is_svelte_whitespace_only(&text.data) => {
                        start_idx += 1;
                        continue;
                    }
                    TemplateNode::Comment(_) => {
                        start_idx += 1;
                        continue;
                    }
                    _ => break,
                }
            }

            // Skip trailing whitespace and comments
            while end_idx > start_idx {
                match nodes[end_idx - 1] {
                    TemplateNode::Text(text) if is_svelte_whitespace_only(&text.data) => {
                        end_idx -= 1;
                        continue;
                    }
                    TemplateNode::Comment(_) => {
                        end_idx -= 1;
                        continue;
                    }
                    _ => break,
                }
            }
        }

        // Collect trimmed nodes (owned) - nodes is Vec<&TemplateNode> so we need to clone
        let mut trimmed_nodes: Vec<TemplateNode> = nodes
            .iter()
            .take(end_idx)
            .skip(start_idx)
            .map(|n| (*n).clone())
            .collect();

        // Trim leading whitespace from first text node and trailing whitespace from last text node
        // This handles cases like `{#if cond}\nmid\n{/if}` which should output `mid` not ` mid `
        // Skip this pass when preserve_whitespace is active — upstream's clean_nodes returns
        // the raw text when preserve_whitespace=true.
        if !preserve_whitespace && !trimmed_nodes.is_empty() {
            // Find the first text node (may be after ConstTag or other non-output nodes).
            // Use the Svelte whitespace set (` \t\r\n\x0C`) — NOT Rust's Unicode
            // trim, which would also strip `\u{00A0}` (`&nbsp;`), treated as
            // content by upstream's `regex_starts_with_whitespaces`.
            for node in trimmed_nodes.iter_mut() {
                if let TemplateNode::Text(text) = node {
                    let trimmed_data = svelte_trim_start(&text.data).to_string();
                    text.data = trimmed_data.into();
                    break;
                }
                // Skip non-output nodes like ConstTag
                if !matches!(node, TemplateNode::ConstTag(_)) {
                    break;
                }
            }
            // Find the last text node (may be before trailing non-output nodes)
            for node in trimmed_nodes.iter_mut().rev() {
                if let TemplateNode::Text(text) = node {
                    let trimmed_data = svelte_trim_end(&text.data).to_string();
                    text.data = trimmed_data.into();
                    break;
                }
                if !matches!(node, TemplateNode::ConstTag(_)) {
                    break;
                }
            }
        }

        // Drop interior Comment nodes (unless preserveComments is set) so they
        // don't show up between expression tags and break whitespace collapsing.
        // Mirrors the first pass of upstream's `clean_nodes` (utils.js line 149)
        // which filters comments before applying the whitespace logic.
        if !self.preserve_comments {
            trimmed_nodes.retain(|n| !matches!(n, TemplateNode::Comment(_)));
        }

        // Mirror upstream `clean_nodes`'s second pass (utils.js lines 222-249):
        // for each Text node, replace its leading/trailing whitespace runs unless
        // the adjacent sibling is an ExpressionTag, then drop nodes whose data
        // ended up empty. Without this, two `{expr}` separated by `\n\t<comment>\n\t`
        // would bake two literal spaces into the output template literal.
        //
        // Upstream mutates `node.data` in place during the same pass so a
        // later Text sees the modified data of `regular[i - 1]` even when the
        // previous Text ended up empty (and was therefore dropped from the
        // final `trimmed` array). We do the same: mutate in place first, then
        // drop empties in a second pass.
        //
        // Skip this entire pass when preserve_whitespace is active.
        if !preserve_whitespace && !trimmed_nodes.is_empty() {
            use crate::compiler::phases::phase3_transform::utils::{
                replace_leading_whitespace, replace_trailing_whitespace,
            };

            let len = trimmed_nodes.len();
            for i in 0..len {
                let (left, right) = trimmed_nodes.split_at_mut(i);
                let (cur_slice, right_rest) = right.split_first_mut().expect("i < len");
                let prev = left.last();
                let next = right_rest.first();
                if let TemplateNode::Text(text) = cur_slice {
                    let prev_is_expr = matches!(prev, Some(TemplateNode::ExpressionTag(_)));
                    let next_is_expr = matches!(next, Some(TemplateNode::ExpressionTag(_)));

                    let mut data = text.data.to_string();
                    if !prev_is_expr {
                        let prev_is_text_ending_with_ws = if let Some(TemplateNode::Text(pt)) = prev
                        {
                            pt.data.as_str().ends_with([' ', '\t', '\r', '\n'])
                        } else {
                            false
                        };
                        let replacement = if prev_is_text_ending_with_ws { "" } else { " " };
                        data = replace_leading_whitespace(&data, replacement);
                    }
                    if !next_is_expr {
                        data = replace_trailing_whitespace(&data, " ");
                    }

                    text.data = data.into();
                }
            }

            // Drop Text nodes whose data is now empty (matches upstream's
            // `if (node.data && (node.data !== ' ' || !can_remove_entirely))
            // trimmed.push(node)` filter). In an SVG-namespace fragment,
            // whitespace-only text collapsed to a single space is removed
            // entirely (upstream's `can_remove_entirely` — clean_nodes,
            // utils.js). The namespace for a block branch is inferred from
            // its element children like upstream's `infer_namespace`
            // fallthrough loop (parent is an IfBlock, so the element scan
            // applies).
            let can_remove_entirely = crate::compiler::phases::phase3_transform::server::visitors::fragment::infer_namespace_from_nodes_owned(&trimmed_nodes, &self.namespace) == "svg";
            trimmed_nodes.retain(|n| match n {
                TemplateNode::Text(t) => {
                    !t.data.is_empty() && (t.data != " " || !can_remove_entirely)
                }
                _ => true,
            });
        }

        // Sort ConstTag nodes topologically (matching official compiler's sort_const_tags)
        trimmed_nodes = self.sort_const_tags_owned(trimmed_nodes);

        // Check if this fragment is standalone (only contains a single RenderTag/Component)
        let is_standalone = self.is_standalone_fragment(&trimmed_nodes);

        // Generate body parts with the appropriate skip_hydration_boundaries flag
        let mut body_generator = self.new_child_generator(is_standalone);
        // Mark that we're inside a block body so async expressions don't use $.save()
        body_generator.in_block_body = true;
        body_generator.in_if_body = true;

        // Helper: is this node "transparent" for prev/next detection?
        // Mirrors how upstream's clean_nodes loop ignores already-filtered comments
        // and how SnippetBlock/ConstTag are hoisted out of the rendered sequence.
        let is_transparent = |n: &TemplateNode| -> bool {
            matches!(n, TemplateNode::ConstTag(_)) || matches!(n, TemplateNode::SnippetBlock(_))
        };

        let mut seen_real_content = false;
        for (idx, node) in trimmed_nodes.iter().enumerate() {
            // Skip whitespace-only text nodes before any real content.
            // This prevents whitespace between const tags from triggering a
            // flush_async_consts, which would split consecutive const tags
            // into separate $$renderer.run() groups.
            // When preserve_whitespace is active (e.g. inside <pre>/<textarea>),
            // upstream does NOT skip these — the raw whitespace is part of the output.
            if !preserve_whitespace
                && !seen_real_content
                && let TemplateNode::Text(text) = node
                && is_svelte_whitespace_only(&text.data)
            {
                continue;
            }

            let is_hoisted = matches!(node, TemplateNode::ConstTag(_))
                || matches!(node, TemplateNode::SnippetBlock(_))
                || matches!(node, TemplateNode::DeclarationTag(_));
            // Flush accumulated async consts before processing non-const content
            if !is_hoisted {
                body_generator.flush_async_consts();
            }
            if !is_hoisted {
                seen_real_content = true;
            }

            // For Text nodes, route through generate_text_with_expr_context so
            // whitespace between two ExpressionTags collapses to a single space
            // (mirroring upstream's clean_nodes whitespace pass + process_children
            // flush). Without this, raw `\n\t` between `{expr}` and `{expr}` ends
            // up baked into the template literal as multiple spaces.
            if let TemplateNode::Text(text) = node {
                let prev_is_expression = {
                    let mut pi = idx;
                    let mut found = false;
                    while pi > 0 {
                        pi -= 1;
                        let pn = &trimmed_nodes[pi];
                        if is_transparent(pn) {
                            continue;
                        }
                        found = matches!(pn, TemplateNode::ExpressionTag(_));
                        break;
                    }
                    found
                };
                let next_is_expression = {
                    let mut ni = idx + 1;
                    let mut found = false;
                    while ni < trimmed_nodes.len() {
                        let nn = &trimmed_nodes[ni];
                        if is_transparent(nn) {
                            ni += 1;
                            continue;
                        }
                        found = matches!(nn, TemplateNode::ExpressionTag(_));
                        break;
                    }
                    found
                };

                body_generator.generate_text_with_expr_context(
                    text,
                    prev_is_expression,
                    next_is_expression,
                )?;
                continue;
            }

            body_generator.generate_node(node, false)?;
        }

        // Final flush for any remaining async consts
        body_generator.flush_async_consts();

        // Lone `<script>` body: append a comment anchor, mirroring upstream
        // `clean_nodes` (utils.js:265-275) — when the only meaningful child is a
        // single `<script>` element, a `<!---->` is emitted after it so the
        // client/server run-scripts logic stays in sync.
        {
            let meaningful: Vec<&TemplateNode> = trimmed_nodes
                .iter()
                .filter(|n| match n {
                    TemplateNode::Text(t) => !is_svelte_whitespace_only(&t.data),
                    TemplateNode::ConstTag(_)
                    | TemplateNode::SnippetBlock(_)
                    | TemplateNode::DeclarationTag(_) => false,
                    _ => true,
                })
                .collect();
            if meaningful.len() == 1
                && let TemplateNode::RegularElement(el) = meaningful[0]
                && el.name.as_str() == "script"
            {
                body_generator
                    .output_parts
                    .push(OutputPart::Html("<!---->".to_string()));
            }
        }

        // Include any snippets defined inside the block as inline SnippetFunction parts
        // This handles cases like `{#if true}{#snippet test()}{/snippet}{/if}`
        // where the snippet function needs to be emitted inside the if-block body
        let mut parts = body_generator.output_parts;
        for snippet in body_generator.snippets {
            parts.push(OutputPart::SnippetFunction {
                name: snippet.name,
                params: snippet.params,
                body: snippet.body_parts,
                dev: self.dev,
            });
        }

        // If we suppressed elseif-flattening (blocker-mismatch), rewrite the
        // single top-level IfBlock's `is_elseif` to false so the codegen
        // flattener (build_parts_with_store_subs) does not re-flatten it.
        if suppress_elseif_flag_on_output {
            // Find the first IfBlock in `parts` and clear its `is_elseif`.
            // The body_generator emits at most one IfBlock here because the
            // input fragment had a single elseif IfBlock as the only
            // meaningful child.
            for part in parts.iter_mut() {
                if let OutputPart::IfBlock { is_elseif, .. } = part {
                    *is_elseif = false;
                    break;
                }
            }
        }

        Ok(parts)
    }
}
