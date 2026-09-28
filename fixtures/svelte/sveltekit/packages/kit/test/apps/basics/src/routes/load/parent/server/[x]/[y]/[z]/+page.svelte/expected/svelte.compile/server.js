import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<h1>message: ${$.escape(page.data.message)}</h1> <pre>${$.escape(JSON.stringify(page.data))}</pre>`);
	});
}