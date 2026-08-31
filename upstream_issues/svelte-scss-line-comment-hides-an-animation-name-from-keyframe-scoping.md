# An SCSS `//` line comment before `animation:` leaves the keyframe reference unscoped

The CSS transform scopes a `@keyframes` name and rewrites every `animation` /
`animation-name` reference to match. A `//` line comment immediately before the
declaration silences the rewrite, so the emitted stylesheet references a
keyframe name that no longer exists.

```svelte
<p class="a">x</p>

<style lang="scss">
	.a {
		// draw it
		animation: spin 1s;
	}

	@keyframes spin {
		from { opacity: 0 }
	}
</style>
```

`svelte.compile(source, { generate: 'client' }).css.code` (5.56.10):

```css
	.a.svelte-7mbzj0 {
		// draw it
		animation: spin 1s;
	}

	@keyframes svelte-7mbzj0-spin {
		from { opacity: 0 }
	}
```

The `@keyframes` is renamed and the `animation` is not, so the animation does
not run. Replacing `//` with `/* draw it */` renames both, and removing the
comment renames both.

`//` is not a CSS comment, so `read_declaration` takes it as the *property* and
everything through the `;` as the *value*:

```
Declaration start=48 property="//" value="draw it\n\t\tanimation: spin 1s"
```

`Declaration` in `phases/3-transform/css/index.js` then tests
`property === 'animation' || property === 'animation-name'`, which is false, and
the whole run — including the real `animation` on the next line — is skipped.

This reaches published code: `trakt-web`'s `LineChart.svelte` has exactly this
shape, and its first `animation: viz-line-draw …` is emitted unscoped while the
other three references in the same file are scoped.

Desired upstream behavior: either treat a `//` line comment in a `lang` block
the way the surrounding tooling does, or raise the same error the non-`lang`
case raises rather than silently folding the following declaration into a value.

rsvelte reproduces the current output byte-for-byte (byte equality is the goal),
pinned in `crates/rsvelte_core/tests/css_scss_line_comment_keyframes.rs`.
