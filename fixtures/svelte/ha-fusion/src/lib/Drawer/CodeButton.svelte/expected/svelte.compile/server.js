import * as $ from 'svelte/internal/server';
import { lang, ripple } from '$lib/Stores';
import { openModal } from 'svelte-modals';
import Ripple from 'svelte-ripple';
import Icon from '@iconify/svelte';

export default function CodeButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		/**
		 * Opens modal
		 */
		function handleClick() {
			openModal(() => import('$lib/Modal/CodeConfig.svelte'));
		}

		/**
		 * Preloads module before click event
		 */
		async function handlePointer() {
			await import('$lib/Modal/CodeConfig.svelte');
		}

		$$renderer.push(`<button class="button"><figure>`);
		Icon($$renderer, { icon: 'ph:code-bold', height: 'none' });
		$$renderer.push(`<!----></figure> <span class="svelte-1lcp3iu">${$.escape($.store_get($$store_subs ??= {}, '$lang', lang)('code'))}</span></button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}