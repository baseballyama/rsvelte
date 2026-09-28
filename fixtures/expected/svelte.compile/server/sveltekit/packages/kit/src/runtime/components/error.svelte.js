import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function Error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<h1>${$.escape(page.status)}</h1> <p>${$.escape(page.error?.message)}</p>`);
	});
}