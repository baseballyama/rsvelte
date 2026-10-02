import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function _error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { error } = $$props;

		$$renderer.push(`<p id="nested-error-message">Nested error: ${$.escape(error.message)} | ${$.escape(page.error?.message === error.message)} | ${$.escape(page.status)}</p>`);
	});
}