import * as $ from 'svelte/internal/server';
import { lang, ripple } from '$lib/Stores';
import { base } from '$app/paths';
import { openModal } from 'svelte-modals';
import Ripple from 'svelte-ripple';
import Icon from '@iconify/svelte';

export default function AppearanceButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let themes;

		/**
		 * Opens modal
		 */
		function handleClick() {
			openModal(() => import('$lib/Modal/AppearanceConfig.svelte'), { themes });
		}

		/**
		 * Preloads module before click event
		 */
		async function handlePointer() {
			await import('$lib/Modal/AppearanceConfig.svelte');

			try {
				const response = await fetch(`${base}/_api/get_all_themes`);
				const data = await response.json();

				if (response.ok) {
					themes = data;
				} else {
					throw new Error(data.message);
				}
			} catch(error) {
				console.error(error);
			}
		}

		$$renderer.push(`<button class="button"><figure${$.attr_style('', { 'margin-right': '0.1rem' })}>`);

		Icon($$renderer, {
			icon: 'material-symbols:invert-colors-rounded',
			height: 'none'
		});

		$$renderer.push(`<!----></figure> <span>${$.escape($.store_get($$store_subs ??= {}, '$lang', lang)('appearance'))}</span></button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}