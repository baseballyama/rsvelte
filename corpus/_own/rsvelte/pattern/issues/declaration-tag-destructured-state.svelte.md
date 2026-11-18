# `declaration-tag-destructured-state.svelte`

**Issue:** [#4892](https://github.com/baseballyama/rsvelte/issues/4892)

A destructured `$state` / `$state.raw` / `$derived` / `$derived.by` declarator in a `{let}` / `{const}` tag:
- **Server:** it was emitted unchanged, `$state` call included. Now it expands like an instance-script declarator, into a `tmp` temp, `$.to_array` helpers and one leaf per path.
- **Client:** each tag restarted the temp numbering, so two tags declared `tmp` twice. The `tmp` / `$$array` / `$$d` numbers now continue from the instance script and earlier tags, and from the `$$array` that an `{#each}` item pattern takes from the template memoizer.
- **Both:** a template read of a destructured name was folded to `undefined`. The analyzer gave the names no `initial`, so they read as a no-argument `$state()`.

The rows cover:
- array and object patterns, plus `$state.raw` with a rest element
- `$derived` with a nested array, and `$derived.by`
- a tag nested in `{#if}`, and one in an `{#each}` that destructures its item
- names that are reassigned and names that are not
- an instance-script destructure before the tags, so the counters continue from it

Nested array patterns under `$state` on the client are #4894 and are left out.
