import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	if (foo) {
		$$renderer.push(`<!--[0--><p>foo</p>`);
	} else {
		$$renderer.push(`<!--[-1--><p>not foo</p>`);
	}

	$$renderer.push(`<!--]-->`);
}