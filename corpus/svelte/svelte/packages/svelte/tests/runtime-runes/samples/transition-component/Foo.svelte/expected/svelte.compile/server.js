import * as $ from 'svelte/internal/server';

export default function Foo($$renderer) {
	function fade(_) {
		return { duration: 100, css: (t) => `opacity: ${t}` };
	}

	$$renderer.push(`<p>foo</p>`);
}