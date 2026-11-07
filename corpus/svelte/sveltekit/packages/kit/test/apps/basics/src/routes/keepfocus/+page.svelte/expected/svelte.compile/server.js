import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';
import { page } from '$app/state';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<input id="input" type="text"${$.attr('value', page.url.searchParams.get('foo'))}/>`);
	});
}