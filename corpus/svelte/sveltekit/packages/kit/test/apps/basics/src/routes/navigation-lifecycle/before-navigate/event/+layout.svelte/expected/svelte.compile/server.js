import * as $ from 'svelte/internal/server';
import { beforeNavigate } from '$app/navigation';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;

		beforeNavigate((navigation) => {
			if (navigation.type === 'link' || navigation.type === 'popstate') {
				console.log(`${navigation.event.type} ${navigation.from?.url.pathname} -> ${navigation.to?.url.pathname}`);
			}
		});

		$$renderer.push(`<a href="/navigation-lifecycle/before-navigate/event/a">a</a> <a href="/navigation-lifecycle/before-navigate/event/b">b</a> `);
		children($$renderer);
		$$renderer.push(`<!---->`);
	});
}