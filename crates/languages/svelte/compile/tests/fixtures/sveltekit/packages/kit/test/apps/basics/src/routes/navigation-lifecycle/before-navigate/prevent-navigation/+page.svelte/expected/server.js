import * as $ from 'svelte/internal/server';
import { beforeNavigate } from '$app/navigation';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let times_triggered = 0;
		let unload = false;

		/** @type {import("$app/navigation").BeforeNavigate['type']} */
		let navigation_type;

		beforeNavigate(({ cancel, type, willUnload, to }) => {
			times_triggered++;
			unload = willUnload;
			navigation_type = type;

			if (!to?.route.id?.includes('redirect')) {
				cancel();
			}
		});

		$$renderer.push(`<h1>prevent navigation</h1> <a href="/navigation-lifecycle/before-navigate/a">a</a> <a href="/navigation-lifecycle/before-navigate/redirect">redirect</a> <a href="/navigation-lifecycle/before-navigate/prevent-navigation?x=1">self</a> <a href="https://google.com" target="_blank" rel="noreferrer">_blank</a> <a href="https://google.de">external</a> <a download="" href="">external</a> <pre>${$.escape(times_triggered)} ${$.escape(unload)} ${$.escape(`${navigation_type}`)}</pre>`);
	});
}