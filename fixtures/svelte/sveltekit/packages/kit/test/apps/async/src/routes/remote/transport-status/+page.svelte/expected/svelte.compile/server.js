import * as $ from 'svelte/internal/server';
import { get_data } from './data.remote.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const result = get_data();

		$$renderer.push(`<button id="deny-btn">Deny and refresh</button> <button id="clear-btn">Clear cookie</button> `);

		if (result.error) {
			$$renderer.push(`<!--[0--><p id="status">${$.escape(result.error.status)}</p>`);
		} else if (result.current !== undefined) {
			$$renderer.push(`<!--[1--><p id="value">${$.escape(result.current)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}