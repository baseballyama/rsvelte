import * as $ from 'svelte/internal/server';
import { afterNavigate } from '$app/navigation';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;

		afterNavigate(() => {
			count += 1;
		});

		$$renderer.push(`<a data-testid="count">count: ${$.escape(count)}</a>`);
	});
}