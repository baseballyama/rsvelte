import * as $ from 'svelte/internal/server';
import { listen } from '@tauri-apps/api/event';
import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let hudText = '';
		let hudEl = null;

		listen('hud-message', (event) => {
			hudText = event.payload;
		});

		$$renderer.push(`<div class="flex h-screen items-center justify-center bg-transparent">`);

		if (hudText) {
			$$renderer.push(`<!--[0--><div class="rounded-full bg-black/70 px-4 py-2 text-sm font-medium text-white">${$.escape(hudText)}</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}