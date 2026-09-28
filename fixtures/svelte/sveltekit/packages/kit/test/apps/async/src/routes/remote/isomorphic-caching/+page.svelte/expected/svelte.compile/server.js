import * as $ from 'svelte/internal/server';
import { get_value, get_call_count } from './isomorphic.remote.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let call_count = '-';
		let dedupe_status = 'idle';

		$$renderer.push(`<p>call count: <span id="call-count">${$.escape(call_count)}</span></p> <button id="await-dedupe">await x3 simultaneously</button> <p>dedupe: <span id="dedupe">${$.escape(dedupe_status)}</span></p>`);
	});
}