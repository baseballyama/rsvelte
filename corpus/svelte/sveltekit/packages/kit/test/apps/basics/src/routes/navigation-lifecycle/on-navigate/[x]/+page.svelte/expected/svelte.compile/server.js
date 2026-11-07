import * as $ from 'svelte/internal/server';
import { onNavigate } from '$app/navigation';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {import("$app/navigation").OnNavigate['from']} */
		let from;

		/** @type {import("$app/navigation").OnNavigate['to']} */
		let to;

		/** @type {Omit<import('$app/navigation').NavigationType, 'enter' | 'leave'>} */
		let type;

		let shallow = false;
		let called_return = false;

		onNavigate((navigation) => {
			from = navigation.from;
			to = navigation.to;
			type = navigation.type;
			shallow = navigation.shallow;
		});

		onNavigate(() => {
			return () => {
				called_return = true;
			};
		});

		$$renderer.push(`<h1>${$.escape(`${from?.url.pathname} -> ${to?.url.pathname} (${type ?? '...'}) ${shallow} ${called_return}`)}</h1> <a href="/navigation-lifecycle/on-navigate/b">/b</a>`);
	});
}