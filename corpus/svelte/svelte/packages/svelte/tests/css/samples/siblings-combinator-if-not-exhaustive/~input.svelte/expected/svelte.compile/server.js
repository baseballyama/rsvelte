import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let foo = true;
	let bar = true;

	$$renderer.push(`<div class="a svelte-14qxl6w"></div> `);

	if (foo) {
		$$renderer.push(`<!--[0--><div class="b svelte-14qxl6w"></div>`);
	} else if (bar) {
		$$renderer.push(`<!--[1--><div class="c svelte-14qxl6w"></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <div class="d svelte-14qxl6w"></div>`);
}