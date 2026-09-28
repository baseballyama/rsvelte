import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div><form>`);

	if (foo) {
		$$renderer.push(`<!--[0--><form><input/></form>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></form></div>`);
}