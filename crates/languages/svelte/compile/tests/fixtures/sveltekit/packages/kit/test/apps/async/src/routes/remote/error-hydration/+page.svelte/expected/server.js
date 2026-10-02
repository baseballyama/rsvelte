import * as $ from 'svelte/internal/server';
import { failing } from './data.remote';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const q = failing();

		$$renderer.push(`<div id="q-error">${$.escape(q.error ? `${q.error.status}: ${q.error.message}` : 'none')}</div>`);
	});
}