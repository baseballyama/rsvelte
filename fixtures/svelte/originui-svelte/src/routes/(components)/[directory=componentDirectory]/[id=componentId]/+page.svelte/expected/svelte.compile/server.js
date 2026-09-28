import * as $ from 'svelte/internal/server';
import ComponentHead from '$lib/demo/component-head.svelte';
import Content from '$lib/demo/component-preview/content.svelte';
import { onNavigate } from '$app/navigation';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		onNavigate((navigation) => {
			if (!document.startViewTransition) return;

			return new Promise((resolve) => {
				document.startViewTransition(async () => {
					resolve();
					await navigation.complete;
				});
			});
		});

		ComponentHead($$renderer, { component: data.component });
		$$renderer.push(`<!----> `);
		Content($$renderer, { isSinglePage: true, component: data.component });
		$$renderer.push(`<!---->`);
	});
}