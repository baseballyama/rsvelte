import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	var $$store_subs;
	let props = {};
	let id = $.store_get($$store_subs ??= {}, '$props', props).id();

	$$renderer.push(`<!---->${$.escape(id)} ${$.escape(props)}`);

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}