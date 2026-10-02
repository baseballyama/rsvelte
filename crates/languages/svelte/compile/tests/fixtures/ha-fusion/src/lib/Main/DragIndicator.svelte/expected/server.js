import * as $ from 'svelte/internal/server';
import { lang, motion } from '$lib/Stores';
import { scale } from 'svelte/transition';
import Icon from '@iconify/svelte';

export default function DragIndicator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		$$renderer.push(`<div${$.attr('title', $.store_get($$store_subs ??= {}, '$lang', lang)('drag_and_drop'))} class="svelte-4zcatm"><div class="icon svelte-4zcatm">`);
		Icon($$renderer, { icon: 'mdi:drag', height: 'none' });
		$$renderer.push(`<!----></div></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}