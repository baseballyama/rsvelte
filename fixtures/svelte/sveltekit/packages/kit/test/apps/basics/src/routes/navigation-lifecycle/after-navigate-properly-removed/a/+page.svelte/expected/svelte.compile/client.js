import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { afterNavigate } from '$app/navigation';

var root = $.from_html(`<h1>/A</h1> <a href="/navigation-lifecycle/after-navigate-properly-removed/a">/a</a> <a href="/navigation-lifecycle/after-navigate-properly-removed/b">/b</a>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	afterNavigate(() => {
		console.log('after navigate called');

		/** @type {HTMLElement | null} */
		const el = document.querySelector('.nav-lifecycle-after-nav-removed-test-target');

		if (el) {
			el.innerText = 'true';
		}
	});

	var fragment = root();

	$.next(4);
	$.append($$anchor, fragment);
	$.pop();
}