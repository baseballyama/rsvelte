import * as $ from 'svelte/internal/server';

export default function Regex_default($$renderer) {
	const f = (pattern = /[(){}]/) => pattern.test("a");
	$$renderer.push(`<p${$.attr_class($.clsx(f() ? "a" : "b"), 'svelte-a5ks3i')}></p>`);
}
