import * as $ from 'svelte/internal/server';
import { slide } from 'svelte/transition';

export default function Main($$renderer) {
	let visible = false;

	$$renderer.push(`<button>toggle</button> <div style="display: none">`);

	if (visible) {
		$$renderer.push(`<!--[0--><p>hello</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></div>`);
}