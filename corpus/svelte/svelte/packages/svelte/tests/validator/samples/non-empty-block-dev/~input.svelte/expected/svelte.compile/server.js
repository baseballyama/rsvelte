import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let x;

	if (x) {
		$$renderer.push(`<!--[0--> `);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}