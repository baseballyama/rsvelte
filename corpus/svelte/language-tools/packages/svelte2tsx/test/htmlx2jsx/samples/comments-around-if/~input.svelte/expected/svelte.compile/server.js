import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div>`);

	if (true) {
		$$renderer.push(`<!--[0--><span>Hey!</span>`);
	} else if (!true) {
		$$renderer.push(`<!--[1--><span>there...</span>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></div>`);
}