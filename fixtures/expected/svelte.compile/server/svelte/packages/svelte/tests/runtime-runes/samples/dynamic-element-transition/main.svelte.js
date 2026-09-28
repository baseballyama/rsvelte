import * as $ from 'svelte/internal/server';
import { fade } from 'svelte/transition';

export default function Main($$renderer) {
	let element = 'div';
	let show = false;

	$$renderer.push(`<button>Toggle</button> `);

	if (show) {
		$$renderer.push('<!--[0-->');

		$.element($$renderer, element, void 0, () => {
			$$renderer.push(`DIV`);
		});
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}