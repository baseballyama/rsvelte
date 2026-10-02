import * as $ from 'svelte/internal/server';
import { onNavigate } from '$app/navigation';
import { resolve } from '$app/paths';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;

		onNavigate((navigation) => {
			if (!document.startViewTransition || navigation.willUnload) return;

			return new Promise((resolve) => {
				document.startViewTransition(async () => {
					resolve();
					await navigation.complete;
					console.log('navigated');
				});
			});
		});

		$$renderer.push(`<ul><li><a${$.attr('href', resolve('/on-navigate/a'))}>a</a></li> <li><a${$.attr('href', resolve('/on-navigate/b'))}>b</a></li></ul> `);
		children($$renderer);
		$$renderer.push(`<!---->`);
	});
}