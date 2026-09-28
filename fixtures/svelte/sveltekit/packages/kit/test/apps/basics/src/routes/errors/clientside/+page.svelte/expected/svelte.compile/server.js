import * as $ from 'svelte/internal/server';
import { browser } from '$app/env';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		if (browser) {
			throw new Error('Crashing now');
		}
	});
}