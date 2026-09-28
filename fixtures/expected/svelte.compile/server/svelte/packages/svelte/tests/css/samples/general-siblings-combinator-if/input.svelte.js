import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let foo = true;
	let bar = true;

	$$renderer.push(`<div class="a svelte-1yypvr0"></div> `);

	if (foo) {
		$$renderer.push(`<!--[0--><div class="b svelte-1yypvr0"></div>`);
	} else if (bar) {
		$$renderer.push(`<!--[1--><div class="c svelte-1yypvr0"></div>`);
	} else {
		$$renderer.push(`<!--[-1--><div class="d svelte-1yypvr0"></div>`);
	}

	$$renderer.push(`<!--]--> <div class="e svelte-1yypvr0"></div>`);
}