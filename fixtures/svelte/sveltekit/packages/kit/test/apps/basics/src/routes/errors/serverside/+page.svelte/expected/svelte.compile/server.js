import * as $ from 'svelte/internal/server';
import { dev } from '$app/env';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		if (dev) {
			// can't throw in prod, the app won't start at all
			throw new Error('Crashing now');
		}
	});
}