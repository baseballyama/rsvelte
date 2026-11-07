import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	var $$store_subs;
	let { state } = $$props;

	$$renderer.push(`<button>${$.escape($.store_get($$store_subs ??= {}, '$state', state))}</button>`);

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}