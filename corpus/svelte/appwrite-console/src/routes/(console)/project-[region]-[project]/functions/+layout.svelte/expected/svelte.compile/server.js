import * as $ from 'svelte/internal/server';
import { addSubPanel, registerCommands } from '$lib/commandCenter';
import { FunctionsPanel } from '$lib/commandCenter/panels';
import { canSeeFunctions } from '$lib/stores/roles';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		$.store_get($$store_subs ??= {}, '$registerCommands', registerCommands)([
			{
				label: 'Find functions',
				callback: () => {
					addSubPanel(FunctionsPanel);
				},
				group: 'functions',
				rank: -1,
				disabled: !$.store_get($$store_subs ??= {}, '$canSeeFunctions', canSeeFunctions)
			}
		]);

		$.head('166sqcv', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Functions - Appwrite</title>`);
			});
		});

		$$renderer.push(`<!--[-->`);
		$.slot($$renderer, $$props, 'default', {}, null);
		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}