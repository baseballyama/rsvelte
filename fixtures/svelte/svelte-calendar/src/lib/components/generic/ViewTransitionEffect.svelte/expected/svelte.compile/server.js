import * as $ from 'svelte/internal/server';
import { scale } from 'svelte/transition';
import { storeContextKey } from '$lib/context';
import { getContext } from 'svelte';

export default function ViewTransitionEffect($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const store = getContext(storeContextKey);

		$$renderer.push(`<div><!--[-->`);
		$.slot($$renderer, $$props, 'default', {}, null);
		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}