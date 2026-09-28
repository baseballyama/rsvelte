import * as $ from 'svelte/internal/server';
import { afterNavigate } from '$app/navigation';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		afterNavigate(() => {
			console.log('after navigate called');

			/** @type {HTMLElement | null} */
			const el = document.querySelector('.nav-lifecycle-after-nav-removed-test-target');

			if (el) {
				el.innerText = 'true';
			}
		});

		$$renderer.push(`<h1>/A</h1> <a href="/navigation-lifecycle/after-navigate-properly-removed/a">/a</a> <a href="/navigation-lifecycle/after-navigate-properly-removed/b">/b</a>`);
	});
}