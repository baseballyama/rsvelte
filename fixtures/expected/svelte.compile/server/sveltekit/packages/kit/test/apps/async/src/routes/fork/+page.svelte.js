import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<a href="/fork/1">Navigate to /1</a> <button>Go to /fork?key=value</button>`);
	});
}