import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function Canonical($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$.head('1mwj5s4', $$renderer, ($$renderer) => {
			$$renderer.push(`<link rel="canonical"${$.attr('href', page.url.origin + page.url.pathname)}/>`);
		});
	});
}