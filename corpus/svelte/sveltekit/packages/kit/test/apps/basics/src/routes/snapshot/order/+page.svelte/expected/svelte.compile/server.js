import * as $ from 'svelte/internal/server';
import { afterNavigate } from '$app/navigation';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {string[]} */
		const order = [];

		/** @type {import('./$types').Snapshot<void>} */
		const snapshot = {
			capture: () => {},
			restore: () => {
				order.push('restore');
			}
		};

		afterNavigate(() => {
			order.push('afterNavigate');
		});

		$$renderer.push(`<p data-testid="order">${$.escape(order.join(','))}</p>`);
		$.bind_props($$props, { snapshot });
	});
}