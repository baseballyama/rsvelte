import * as $ from 'svelte/internal/server';
import { live_fail } from './data.remote';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { params } = $$props;
		const q = $.derived(() => live_fail(params.key));

		$$renderer.push(`<div id="live-error">${$.escape(q().error ? `${q().error.status}: ${q().error.message}` : 'none')}</div>`);
	});
}