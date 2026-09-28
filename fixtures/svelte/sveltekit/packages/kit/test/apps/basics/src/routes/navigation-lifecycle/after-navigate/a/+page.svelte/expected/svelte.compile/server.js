import * as $ from 'svelte/internal/server';
import { afterNavigate } from '$app/navigation';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {import('$app/navigation').AfterNavigate['from'] | null} */
		let from;

		/** @type {import('$app/navigation').AfterNavigate['to']} */
		let to;

		afterNavigate((navigation) => {
			from = navigation.from;
			to = navigation.to;
		});

		$$renderer.push(`<h1>${$.escape(`${from?.url.pathname} -> ${to?.url.pathname}`)}</h1> <a href="/navigation-lifecycle/after-navigate/b">/b</a>`);
	});
}