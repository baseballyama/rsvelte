import * as $ from 'svelte/internal/server';

export const findMe = writable('');

export default function Find_references_$store($$renderer) {
	var $$store_subs;

	if ($.store_get($$store_subs ??= {}, '$findMe', findMe)) {
		$.store_get($$store_subs ??= {}, '$findMe', findMe);
	}

	$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$findMe', findMe))}`);

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}