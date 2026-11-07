import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<button>toggle</button> `);

	if (visible) {
		$$renderer.push(`<!--[0--><p>hello!</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}