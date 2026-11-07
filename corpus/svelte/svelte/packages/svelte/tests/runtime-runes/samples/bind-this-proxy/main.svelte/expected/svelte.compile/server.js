import * as $ from 'svelte/internal/server';
import Component from './Component.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let type = Component;
		let elem = void 0;

		$$renderer.push(`<button>Toggle</button> `);

		if (type) {
			$$renderer.push('<!--[-->');

			type($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Content`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}