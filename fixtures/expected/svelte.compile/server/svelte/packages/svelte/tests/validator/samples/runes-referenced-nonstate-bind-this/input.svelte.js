import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let no_need;
	let does_need1;
	let does_need2 = void 0;

	$$renderer.push(`<div></div> `);

	if (true) {
		$$renderer.push(`<!--[0--><div></div> <div></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}