import * as $ from 'svelte/internal/server';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {typeof import('./Dynamic.svelte').default}*/
		let Dynamic;

		$$renderer.push(`<button>load component</button> `);

		if (Dynamic) {
			$$renderer.push('<!--[-->');
			Dynamic($$renderer, {});
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}