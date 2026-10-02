import * as $ from 'svelte/internal/server';

export default function Invalid_svelte_ignore01_input($$renderer) {
	$$renderer.push(`<div>`);

	if (true) {
		$$renderer.push(`<!--[0-->A`);
	} else {
		$$renderer.push(`<!--[-1--><label tabindex="0">Click</label> <ul tabindex="0"></ul>`);
	}

	$$renderer.push(`<!--]--></div>`);
}