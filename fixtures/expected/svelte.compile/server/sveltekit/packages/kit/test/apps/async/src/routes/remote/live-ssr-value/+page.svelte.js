import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { live_value, notify } from './data.remote.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const key = page.url.searchParams.get('key') ?? 'default';
		const live = live_value(key);

		$$renderer.push(`<p id="live-state">${$.escape(live.ready ? live.current : 'loading')}</p> <button id="notify">notify</button>`);
	});
}