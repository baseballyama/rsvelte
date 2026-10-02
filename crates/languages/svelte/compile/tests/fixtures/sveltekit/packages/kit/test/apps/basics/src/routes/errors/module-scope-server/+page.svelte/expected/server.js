import * as $ from 'svelte/internal/server';
import { dev } from '$app/env';

if (dev) {
	// can't throw in prod, the app won't start at all
	throw new Error('Crashing now');
}

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {});
}