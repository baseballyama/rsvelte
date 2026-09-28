import * as $ from 'svelte/internal/server';
import { bump, get_count } from './data.remote';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { params } = $$props;
		const q = $.derived(() => get_count(params.key));

		$$renderer.push(`<div id="value">${$.escape(q().current ?? 'unset')}</div> <div id="error">${$.escape(q().error ? `${q().error.status}: ${q().error.message}` : 'none')}</div> <button>bump</button>`);
	});
}