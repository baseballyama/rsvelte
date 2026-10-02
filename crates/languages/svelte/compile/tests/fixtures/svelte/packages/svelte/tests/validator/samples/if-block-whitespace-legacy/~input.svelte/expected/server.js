import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div>`);

	if (true) {
		$$renderer.push(`<!--[0--><p>hi</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></div>`);
}