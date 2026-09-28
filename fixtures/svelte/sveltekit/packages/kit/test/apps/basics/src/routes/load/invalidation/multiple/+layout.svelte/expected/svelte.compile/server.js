import * as $ from 'svelte/internal/server';
import { invalidate, refreshAll } from '$app/navigation';
import { page } from '$app/state';
import { increment_layout, increment_page } from './state';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @param {string} str */
		async function update(str) {
			if (str !== 'page') {
				increment_layout();
			}

			if (str !== 'layout') {
				increment_page();
			}

			if (str === 'all') {
				refreshAll();
			} else {
				invalidate(`invalid:${str}`);
			}
		}

		$$renderer.push(`<button class="layout">Refresh layout</button> <button class="page">Refresh page</button> <button class="all">Refresh all</button> <p>layout: ${$.escape(page.data.count_layout)}, page: ${$.escape(page.data.count_page)}</p> <!--[-->`);
		$.slot($$renderer, $$props, 'default', {}, null);
		$$renderer.push(`<!--]-->`);
	});
}