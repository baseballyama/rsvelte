import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { writable } from 'svelte/store';

export default function CrossfadeProvider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const noop = () => false;
		const store = getContext('crossfade') || writable({ send: noop, receive: noop });

		$$renderer.push(`<!--[-->`);

		$.slot(
			$$renderer,
			$$props,
			'default',
			{
				key: $.store_get($$store_subs ??= {}, '$store', store).key,
				send: $.store_get($$store_subs ??= {}, '$store', store).send,
				receive: $.store_get($$store_subs ??= {}, '$store', store).receive
			},
			null
		);

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}