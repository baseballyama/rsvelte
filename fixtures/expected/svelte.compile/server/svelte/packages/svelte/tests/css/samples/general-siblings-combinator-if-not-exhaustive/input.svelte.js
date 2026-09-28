import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let foo = true;
	let bar = true;

	$$renderer.push(`<div class="a svelte-e8pcqz"></div> `);

	if (foo) {
		$$renderer.push(`<!--[0--><div class="b svelte-e8pcqz"></div>`);
	} else if (bar) {
		$$renderer.push(`<!--[1--><div class="c svelte-e8pcqz"></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <div class="d svelte-e8pcqz"></div>`);
}