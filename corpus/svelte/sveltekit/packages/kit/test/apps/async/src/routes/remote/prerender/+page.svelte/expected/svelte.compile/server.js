import * as $ from 'svelte/internal/server';
import { prerendered, prerendered_entries, with_read } from './prerender.remote.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let prerendered_result = null;
		let live_result = null;
		let read_result = null;

		$$renderer.push(`<a href="/remote/prerender/whole-page">whole-page</a> <a href="/remote/prerender/functions-only">functions-only</a> <button id="fetch-prerendered">${$.escape(prerendered_result)}</button> <button id="fetch-not-prerendered">${$.escape(live_result)}</button> <button id="fetch-with-read">${$.escape(read_result)}</button>`);
	});
}