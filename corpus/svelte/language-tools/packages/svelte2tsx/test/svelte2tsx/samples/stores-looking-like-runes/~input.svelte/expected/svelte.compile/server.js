import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	var $$store_subs;
	const props = null;

	$.store_get($$store_subs ??= {}, '$props', props);

	const state = null;

	$.store_get($$store_subs ??= {}, '$state', state);

	const derived = null;

	$.store_get($$store_subs ??= {}, '$derived', derived);
	$$renderer.push(`<!----> `);

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}