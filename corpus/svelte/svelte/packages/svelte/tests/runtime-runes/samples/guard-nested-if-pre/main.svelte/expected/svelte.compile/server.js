import * as $ from 'svelte/internal/server';
import Component from './Component.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let p = 'b';

		if (p || !p) {
			$$renderer.push('<!--[0-->');

			if (p) {
				$$renderer.push('<!--[0-->');
				Component($$renderer, { p });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <button>a</button>`);
	});
}