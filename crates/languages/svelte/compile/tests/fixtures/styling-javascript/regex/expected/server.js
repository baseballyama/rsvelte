import * as $ from 'svelte/internal/server';

export default function Regex($$renderer) {
	const pattern = /[(){}\/]+/giu;
	$$renderer.push(`<p${$.attr_class($.clsx(pattern.test("a") ? "a" : "b"), 'svelte-1i6hxbu')}></p>`);
}
