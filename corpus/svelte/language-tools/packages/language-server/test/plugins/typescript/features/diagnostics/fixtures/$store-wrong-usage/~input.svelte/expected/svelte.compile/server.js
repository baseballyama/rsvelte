import * as $ from 'svelte/internal/server';

const noStoreModule = "not a store";

export default function Input($$renderer) {
	var $$store_subs;
	let store = "not a store";

	$.store_get($$store_subs ??= {}, '$store', store);

	if ($.store_get($$store_subs ??= {}, '$store', store)) {}

	$.store_get($$store_subs ??= {}, '$noStoreModule', noStoreModule);
	$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$store', store))} `);

	if ($.store_get($$store_subs ??= {}, '$store', store)) {
		$$renderer.push('<!--[0-->');
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> ${$.escape($.store_get($$store_subs ??= {}, '$noStoreModule', noStoreModule))}`);

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}