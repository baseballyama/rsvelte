import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let foo = true;
	let bar = true;

	$$renderer.push(`<div class="a svelte-kpclan"></div> `);

	if (foo) {
		$$renderer.push(`<!--[0--><div class="b svelte-kpclan"></div>`);
	} else if (bar) {
		$$renderer.push(`<!--[1--><div class="c svelte-kpclan"></div>`);
	} else {
		$$renderer.push(`<!--[-1--><div class="d svelte-kpclan"></div>`);
	}

	$$renderer.push(`<!--]--> <div class="e svelte-kpclan"></div>`);
}