---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

fix(svelte2tsx): move a default-slot `let:` element's leading gap space ahead
of its `$$slot_def.default` destructure. Upstream's `Element.
performTransformation` runs the destructure through the SAME `transform()`
call as the element's own opening-tag rewrite, so the element's leading gap
lands before the destructure instead of before the element itself. rsvelte
inserted the destructure with no leading space and left the gap on the
element, so `<Foo><div let:x>{x}</div></Foo>` produced
`;{const {…,x,} = …$$slot_def.default;$$_$$; { svelteHTML.createElement(…`
(extra space before the element) instead of upstream's
`; {const {…,x,} = …$$slot_def.default;$$_$$;{ svelteHTML.createElement(…`.
