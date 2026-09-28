import * as $ from 'svelte/internal/server';
import { app } from '$lib/stores/app';
import Light from '../assets/cursor-ai.svg';
import Dark from '../assets/dark/cursor-ai.svg';

export default function CursorIconLarge($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		$$renderer.push(`<img${$.attr('src', $.store_get($$store_subs ??= {}, '$app', app).themeInUse === 'dark' ? Dark : Light)} width="20" height="20" alt="Cursor"/>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}