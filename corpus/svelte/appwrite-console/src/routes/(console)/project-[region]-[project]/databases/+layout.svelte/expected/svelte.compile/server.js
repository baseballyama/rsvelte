import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { DatabasesPanel } from '$lib/commandCenter/panels';
import { addSubPanel, registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { children } = $$props;

		$.head('461p3i', $$renderer, ($$renderer) => {
			$$renderer.push(`<!---->`);

			{
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>Databases - Appwrite</title>`);
				});
			}

			$$renderer.push(`<!---->`);
		});

		children($$renderer);
		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}