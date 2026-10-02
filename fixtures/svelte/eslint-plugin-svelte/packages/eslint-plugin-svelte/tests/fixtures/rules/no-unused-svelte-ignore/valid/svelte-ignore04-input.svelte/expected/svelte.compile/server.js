import * as $ from 'svelte/internal/server';

export default function Svelte_ignore04_input($$renderer) {
	$$renderer.push(`<div>`);

	if (true) {
		$$renderer.push(`<!--[0--><label tabindex="0">Click</label> <ul tabindex="0"></ul>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></div> <div>`);

	if (true) {
		$$renderer.push(`<!--[0-->A`);
	} else {
		$$renderer.push(`<!--[-1--><div></div> <label tabindex="0">Click</label> <ul tabindex="0"></ul>`);
	}

	$$renderer.push(`<!--]--></div>`);
}