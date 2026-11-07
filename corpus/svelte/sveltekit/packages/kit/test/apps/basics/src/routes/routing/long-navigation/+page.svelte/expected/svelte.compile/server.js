import * as $ from 'svelte/internal/server';
import { onNavigate } from '$app/navigation';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		onNavigate(() => new Promise((resolve) => setTimeout(resolve, 3000)));
		$$renderer.push(`<a href="/routing">Go to routing</a>`);
	});
}