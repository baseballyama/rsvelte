import * as $ from 'svelte/internal/server';
import { dashboard, lang, ripple, record } from '$lib/Stores';
import Ripple from 'svelte-ripple';
import Icon from '@iconify/svelte';
import { generateId } from '$lib/Utils';
import { createEventDispatcher } from 'svelte';

export default function SidebarButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const dispatch = createEventDispatcher();

		/**
		 * Creates a new sidebar object in sidebar items
		 */
		function handleClick() {
			$.store_mutate($$store_subs ??= {}, '$dashboard', dashboard, $.store_get($$store_subs ??= {}, '$dashboard', dashboard).sidebar = [
				{
					type: 'configure',
					id: generateId($.store_get($$store_subs ??= {}, '$dashboard', dashboard))
				},
				...$.store_get($$store_subs ??= {}, '$dashboard', dashboard).sidebar
			]);

			$.store_get($$store_subs ??= {}, '$record', record)();
			dispatch('clicked');
		}

		$$renderer.push(`<button class="button dropdown"><figure class="svelte-sruxp5">`);

		Icon($$renderer, {
			icon: 'solar:sidebar-minimalistic-bold-duotone',
			height: 'none'
		});

		$$renderer.push(`<!----></figure> ${$.escape($.store_get($$store_subs ??= {}, '$lang', lang)('sidebar'))}</button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}