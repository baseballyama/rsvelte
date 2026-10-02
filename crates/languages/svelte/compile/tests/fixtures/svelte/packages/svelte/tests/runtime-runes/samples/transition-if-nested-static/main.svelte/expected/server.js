import * as $ from 'svelte/internal/server';
import { slide } from 'svelte/transition';

export default function Main($$renderer) {
	let showText = false;
	let show = true;

	$$renderer.push(`<button>Toggle</button> `);

	if (showText) {
		$$renderer.push('<!--[0-->');

		if (show) {
			$$renderer.push(`<!--[0--><div>Should not transition out</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}