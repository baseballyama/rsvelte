import * as $ from 'svelte/internal/server';

export default function Template01_input($$renderer) {
	let foo = false;
	let bar = undefined;

	$$renderer.push(`<button></button> `);

	if (!foo) {
		$$renderer.push(`<!--[0--><div></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (!foo && bar) {
		$$renderer.push(`<!--[0--><div></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}