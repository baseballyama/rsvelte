//! `{#await}` blocks.
//! Mirrors `htmlxtojsx_v2/nodes/AwaitPendingCatchBlock.ts`.

use crate::ast::template::AwaitBlock;
use crate::svelte2tsx::magic_string::MagicString;
use crate::svelte2tsx::svelte2tsx::Svelte2TsxOptions;

use crate::svelte2tsx::template::ctx::{Counter, TemplateNodeExt};
use crate::svelte2tsx::template::utils::expr::{get_expression_range, get_expression_text};
use crate::svelte2tsx::template::walk::process_fragment_inplace;

/// Handle an await block: `{#await promise}...{:then value}...{:catch error}...{/await}`.
///
/// Generates patterns like:
/// - `{#await promise}pending{:then value}resolved{/await}`
///   → `{  { const $$_value = await (promise);{ const value = $$_value; resolved}}}`
/// - `{#await promise then value}resolved{/await}`
///   → `{  { const $$_value = await (promise);{ const value = $$_value; resolved}}`
/// - `{#await promise catch error}rejected{/await}`
///   → `{  { try { const $$_value = await (promise);} catch(error) { rejected}}`
pub(crate) fn handle_await_block(
    block: &AwaitBlock,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString<'_>,
    counter: &mut Counter,
    depth: u32,
) {
    if block.start >= block.end {
        return;
    }

    let expr_text = get_expression_text(&block.expression, source);

    // Determine the structure of the await block:
    // 1. `{#await promise}` pending `{:then value}` then `{/await}` (has pending, then)
    // 2. `{#await promise then value}` then `{/await}` (no pending, immediate then)
    // 3. `{#await promise catch error}` catch `{/await}` (no pending, immediate catch)
    // 4. `{#await promise}` pending `{:then value}` then `{:catch error}` catch `{/await}`

    let has_pending = block.pending.as_ref().is_some_and(|p| !p.nodes.is_empty());
    let has_then = block.then.is_some();
    let has_catch = block.catch.is_some();

    let value_text = block
        .value
        .as_ref()
        .map(|v| get_expression_text(v, source).to_string())
        .unwrap_or_default();

    let error_text = block
        .error
        .as_ref()
        .map(|e| get_expression_text(e, source).to_string())
        .unwrap_or_default();

    if has_pending {
        // Pattern: {#await promise} pending {:then value} then {:catch error} catch {/await}
        let pending = block.pending.as_ref().unwrap();
        let pending_start = if !pending.nodes.is_empty() {
            pending.nodes[0].start()
        } else {
            block.end
        };

        // Handle then
        if let Some(ref then) = block.then {
            let then_start = if !then.nodes.is_empty() {
                then.nodes[0].start()
            } else {
                block.end
            };

            let prev_end = if !pending.nodes.is_empty() {
                pending.nodes.last().unwrap().end()
            } else {
                pending_start
            };

            // The PROMISE expression source-wise lives inside the
            // `{#await PROMISE}` opener but generated-wise belongs at the
            // `{:then VALUE}` boundary. `move_range` relocates the
            // expression chunk past the pending fragment so its
            // per-character source map survives intact; the `const
            // $$_value = await (…); { const VALUE = $$_value; ` wrapper
            // is attached as the relocated chunk's intro / outro so it
            // travels with the expression.
            if let Some((expr_start, expr_end)) = get_expression_range(&block.expression) {
                str.move_range(expr_start, expr_end, prev_end);
                str.overwrite(block.start, expr_start, "   { ");
                if expr_end < pending_start {
                    str.overwrite(expr_end, pending_start, "");
                }
                // When a `catch` (or error variable) is present, the await
                // must be wrapped in a `try {` so the later `} catch(...) {`
                // is balanced. Mirrors upstream `handleAwait` emitting
                // `try { ` whenever `error || !catch.skip`.
                // `const $$_value = ` and the `{ const VALUE = $$_value; ` inner
                // block are emitted ONLY when there's a `{:then value}` binding
                // (mirrors official `handleAwait`, which gates both on
                // `awaitBlock.value`). A bare `{:then}` is just `await (…);` with
                // the then-body inline.
                str.prepend_right(
                    expr_start,
                    match (has_catch, value_text.is_empty()) {
                        (true, false) => "try { const $$_value = await (",
                        (true, true) => "try { await (",
                        (false, false) => "const $$_value = await (",
                        (false, true) => "await (",
                    },
                );
                let suffix = if !value_text.is_empty() {
                    format!(");{{ const {} = $$_value; ", value_text)
                } else {
                    ");".to_string()
                };
                str.append_left(expr_end, &suffix);
                if prev_end < then_start {
                    str.overwrite(prev_end, then_start, "");
                }
                process_fragment_inplace(pending, source, options, str, counter, depth);
            } else {
                // Parser couldn't span the expression — fall back to
                // the original monolithic bake.
                str.overwrite(block.start, pending_start, "   { ");
                process_fragment_inplace(pending, source, options, str, counter, depth);
                // `try { ` wrapper when a catch/error is present (see above).
                let try_prefix = if has_catch { "try { " } else { "" };
                if !value_text.is_empty() {
                    str.overwrite(
                        prev_end,
                        then_start,
                        &format!(
                            "{}const $$_value = await ({});{{ const {} = $$_value; ",
                            try_prefix, expr_text, value_text
                        ),
                    );
                } else {
                    str.overwrite(
                        prev_end,
                        then_start,
                        &format!("{}const $$_value = await ({});{{ ", try_prefix, expr_text),
                    );
                }
            }

            process_fragment_inplace(then, source, options, str, counter, depth);

            // Handle catch after then
            if let Some(ref catch) = block.catch {
                let catch_start = if !catch.nodes.is_empty() {
                    catch.nodes[0].start()
                } else {
                    block.end
                };

                let then_end = if !then.nodes.is_empty() {
                    then.nodes.last().unwrap().end()
                } else {
                    then_start
                };

                // Close the `try` (always) plus the value block (only when a
                // `{:then value}` binding opened one), then open the catch.
                let close_before_catch = if value_text.is_empty() { "}" } else { "}}" };
                if !error_text.is_empty() {
                    str.overwrite(
                        then_end,
                        catch_start,
                        &format!(
                            "{} catch($$_e) {{ const {} = __sveltets_2_any();",
                            close_before_catch, error_text
                        ),
                    );
                } else {
                    str.overwrite(
                        then_end,
                        catch_start,
                        &format!("{} catch($$_e) {{ ", close_before_catch),
                    );
                }

                process_fragment_inplace(catch, source, options, str, counter, depth);

                let catch_end = if !catch.nodes.is_empty() {
                    catch.nodes.last().unwrap().end()
                } else {
                    catch_start
                };

                if catch_end < block.end {
                    str.overwrite(catch_end, block.end, "}}");
                }
            } else {
                // No catch: close the value block (if any) + the outer await
                // block. A bare `{:then}` opened only the outer block.
                let then_end = if !then.nodes.is_empty() {
                    then.nodes.last().unwrap().end()
                } else {
                    then_start
                };
                if then_end < block.end {
                    let close = if value_text.is_empty() { "}" } else { "}}" };
                    str.overwrite(then_end, block.end, close);
                }
            }
        } else {
            // No `:then` after the pending block. Covers
            // `{#await p}pending{/await}` (pending only) and
            // `{#await p}pending{:catch e}…{/await}` (pending + catch, no then).
            // Previously this branch emitted only a trailing `}` — it never
            // opened the block, dropped the `await(promise)` entirely, and
            // ignored the catch, producing brace-unbalanced / invalid TSX.
            // Mirror upstream `handleAwait`: `{ <pending> [try {] await(p);
            // [} catch($$_e) { … }] }`.
            let pending_end = if !pending.nodes.is_empty() {
                pending.nodes.last().unwrap().end()
            } else {
                pending_start
            };

            // Opening `{ ` — consume the `{#await PROMISE}` opener (PROMISE is
            // re-emitted as `await(...)` after the pending body).
            str.overwrite(block.start, pending_start, "   { ");
            process_fragment_inplace(pending, source, options, str, counter, depth);

            if let Some(ref catch) = block.catch {
                let catch_start = if !catch.nodes.is_empty() {
                    catch.nodes[0].start()
                } else {
                    block.end
                };
                let header = if !error_text.is_empty() {
                    format!(
                        "try {{ await ({});}} catch($$_e) {{ const {} = __sveltets_2_any();",
                        expr_text, error_text
                    )
                } else {
                    format!("try {{ await ({});}} catch($$_e) {{ ", expr_text)
                };
                if pending_end < catch_start {
                    str.overwrite(pending_end, catch_start, &header);
                } else {
                    str.append_left(pending_end, &header);
                }
                process_fragment_inplace(catch, source, options, str, counter, depth);
                let catch_end = if !catch.nodes.is_empty() {
                    catch.nodes.last().unwrap().end()
                } else {
                    catch_start
                };
                if catch_end < block.end {
                    str.overwrite(catch_end, block.end, "}}");
                }
            } else if pending_end < block.end {
                str.overwrite(pending_end, block.end, &format!("await ({});}}", expr_text));
            }
        }
    } else if has_then {
        // Pattern: {#await promise then value} then {/await} (no pending)
        // Or:      {#await promise then value} then {:catch error} catch {/await}
        let then = block.then.as_ref().unwrap();
        let then_start = if !then.nodes.is_empty() {
            then.nodes[0].start()
        } else {
            block.end
        };

        // In source order, `{#await PROMISE then VALUE}` is followed
        // directly by the then-body. The generated wrapper also places
        // the expression before VALUE (and VALUE before the body), so
        // we can preserve PROMISE's chunk in place by splitting the
        // header overwrite into a prefix / suffix pair around the
        // expression range.
        // `const $$_value = ` and the `{ const VALUE = $$_value; … }` scope are
        // emitted only for a `{:then value}` binding (mirrors official
        // `handleAwait`, which gates both on `awaitBlock.value`). A bare
        // `{#await … then}` is just `await (…);` with the body inline (the body
        // elements provide their own block). `value_close` is the matching `}`
        // for the value scope, emitted by the close logic below.
        let value_close = if value_text.is_empty() { "" } else { "}" };
        let (header_prefix, header_suffix) = if has_catch {
            (
                if value_text.is_empty() {
                    "   { try { await ("
                } else {
                    "   { try { const $$_value = await ("
                },
                if !value_text.is_empty() {
                    format!(");{{ const {} = $$_value; ", value_text)
                } else {
                    ");".to_string()
                },
            )
        } else {
            (
                if value_text.is_empty() {
                    "   { await ("
                } else {
                    "   { const $$_value = await ("
                },
                if !value_text.is_empty() {
                    format!(");{{ const {} = $$_value; ", value_text)
                } else {
                    ");".to_string()
                },
            )
        };

        if let Some((expr_start, expr_end)) = get_expression_range(&block.expression) {
            str.overwrite(block.start, expr_start, header_prefix);
            if expr_end < then_start {
                str.overwrite(expr_end, then_start, &header_suffix);
            } else {
                str.append_left(expr_end, &header_suffix);
            }
        } else {
            str.overwrite(
                block.start,
                then_start,
                &format!("{}{}{}", header_prefix, expr_text, header_suffix),
            );
        }

        process_fragment_inplace(then, source, options, str, counter, depth);

        let then_end = if !then.nodes.is_empty() {
            then.nodes.last().unwrap().end()
        } else {
            then_start
        };

        if has_catch {
            // Handle catch after then
            let catch = block.catch.as_ref().unwrap();
            let catch_start = if !catch.nodes.is_empty() {
                catch.nodes[0].start()
            } else {
                block.end
            };

            if !error_text.is_empty() {
                str.overwrite(
                    then_end,
                    catch_start,
                    &format!(
                        "{}}} catch($$_e) {{ const {} = __sveltets_2_any();",
                        value_close, error_text
                    ),
                );
            } else {
                // Close the value block (only when there's a `{:then value}`
                // binding) + `try`, then open the catch. Always emit `($$_e)`.
                str.overwrite(
                    then_end,
                    catch_start,
                    &format!("{}}} catch($$_e) {{ ", value_close),
                );
            }

            process_fragment_inplace(catch, source, options, str, counter, depth);

            let catch_end = if !catch.nodes.is_empty() {
                catch.nodes.last().unwrap().end()
            } else {
                catch_start
            };

            if catch_end < block.end {
                str.overwrite(catch_end, block.end, "}}");
            }
        } else {
            // Close the value block (if any) + the outer await block. This
            // handles both the normal case (then_end < block.end: the then
            // body ends before {/await}, so we overwrite the gap) and the
            // empty-then-body case (then_end == block.end: the overwrite from
            // expr_end to block.end already consumed that region, so we must
            // append rather than overwrite a zero-length range).
            let close = format!("{}}}", value_close);
            if then_end < block.end {
                str.overwrite(then_end, block.end, &close);
            } else {
                str.append_left(block.end, &close);
            }
        }
    } else if has_catch {
        // Pattern: {#await promise catch error} catch {/await} (no pending, no then)
        let catch = block.catch.as_ref().unwrap();
        let catch_start = if !catch.nodes.is_empty() {
            catch.nodes[0].start()
        } else {
            block.end
        };

        let (header_prefix, header_suffix) = (
            "   { try { await (",
            if !error_text.is_empty() {
                format!(
                    ");}} catch($$_e) {{ const {} = __sveltets_2_any();",
                    error_text
                )
            } else {
                ");} catch($$_e) { ".to_string()
            },
        );
        if let Some((expr_start, expr_end)) = get_expression_range(&block.expression) {
            str.overwrite(block.start, expr_start, header_prefix);
            if expr_end < catch_start {
                str.overwrite(expr_end, catch_start, &header_suffix);
            } else {
                str.append_left(expr_end, &header_suffix);
            }
        } else if !error_text.is_empty() {
            str.overwrite(
                block.start,
                catch_start,
                &format!(
                    "   {{ try {{ await ({});}} catch($$_e) {{ const {} = __sveltets_2_any();",
                    expr_text, error_text
                ),
            );
        } else {
            str.overwrite(
                block.start,
                catch_start,
                &format!("   {{ try {{ await ({});}} catch($$_e) {{ ", expr_text),
            );
        }

        process_fragment_inplace(catch, source, options, str, counter, depth);

        let catch_end = if !catch.nodes.is_empty() {
            catch.nodes.last().unwrap().end()
        } else {
            catch_start
        };

        if catch_end < block.end {
            str.overwrite(catch_end, block.end, "}}");
        }
    } else {
        // Bare await block `{#await promise}{/await}` (no pending/then/catch).
        // Official `handleAwait` emits `{ await (EXPR);}` — the promise is
        // always awaited, so the `await` keyword must be present (it was
        // previously dropped, emitting `{EXPR;}`).
        if let Some((expr_start, expr_end)) = get_expression_range(&block.expression) {
            str.overwrite(block.start, expr_start, "{ await (");
            if expr_end < block.end {
                str.overwrite(expr_end, block.end, ");}");
            } else {
                str.append_left(expr_end, ");}");
            }
        } else {
            str.overwrite(
                block.start,
                block.end,
                &format!("{{ await ({});}}", expr_text),
            );
        }
    }
}
