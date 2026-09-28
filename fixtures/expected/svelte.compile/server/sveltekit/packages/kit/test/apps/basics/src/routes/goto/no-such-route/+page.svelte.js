import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let message = '...';

		$$renderer.push(`<button>goto</button> <p>${$.escape(message)}</p>`);
	});
}