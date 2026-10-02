import * as $ from 'svelte/internal/server';
import { fade } from 'svelte/transition';

export default function Component($$renderer) {
	let show = true;

	$$renderer.push(`<h1>Outside</h1> `);

	if (show) {
		$$renderer.push(`<!--[0--><button>Hide</button>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}