import * as $ from 'svelte/internal/server';
import { beforeNavigate } from '$app/navigation';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		beforeNavigate(({ complete }) => {
			complete.then(() => {
				console.log('complete');
			});
		});

		$$renderer.push(`<a href="/navigation-lifecycle/before-navigate/redirect">redirect</a>`);
	});
}