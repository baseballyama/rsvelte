import * as $ from 'svelte/internal/server';

function hi($$renderer, a, b = 2) {
	$$renderer.push(`<!---->${$.escape(a)} `);

	if (b === 'a') {
		$$renderer.push(`<!--[0-->${$.escape(b)}`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}

export default function Input($$renderer) {
	// @ts-check
	/**
	 * @typedef {'a' | 'b'} TypeA
	*/
	/**@type {TypeA}*/ (
	hi)($$renderer, 'c', 'd');
}