import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let pathname = void 0;

		$$renderer.push(`<h1>${$.escape(`${pathname}`)}</h1> <button>click</button>`);
	});
}