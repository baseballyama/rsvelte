import * as $ from 'svelte/internal/server';
import { afterNavigate } from '$app/navigation';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;
		let type = '';

		afterNavigate((event) => {
			count += 1;
			type = event.type;
		});

		$$renderer.push(`<p>${$.escape(type.toString())} ${$.escape(count)}</p>`);
	});
}