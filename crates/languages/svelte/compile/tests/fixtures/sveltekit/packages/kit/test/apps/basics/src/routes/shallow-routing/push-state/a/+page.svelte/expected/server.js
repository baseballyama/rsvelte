import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { goto } from '$app/navigation';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<h1>a</h1> <p>active: ${$.escape(page.state.active ?? false)}</p> <span data-id="shallow">${$.escape(page.shallow ? page.shallow.url.pathname : 'null')}</span> <button data-id="shallow-b">shallow to b</button>`);
	});
}