import * as $ from 'svelte/internal/server';

export default function Regex_state($$renderer) {
	let pattern = /a/g;
	$$renderer.push(`<p${$.attr_class($.clsx(pattern.test("a") ? "a" : "b"), 'svelte-we737y')}></p>`);
}
