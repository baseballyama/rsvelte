import * as $ from 'svelte/internal/server';
import { fade } from 'svelte/transition';

export default function Input($$renderer) {
	let visible = false;

	$$renderer.push(`<button>toggle</button> `);

	if (visible) {
		$$renderer.push(`<!--[0--><div>fades in and out</div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}