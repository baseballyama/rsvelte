import * as $ from 'svelte/internal/server';
import { browser } from '$app/env';

if (browser) {
	throw new Error('Crashing now');
}

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {});
}