import * as $ from "svelte/internal/server";
export default function Store_that_is_not_a_store($$renderer) {
	var $$store_subs;
	let count = 1;
	let later;
	const doubled = $.store_get($$store_subs ??= {}, "$count", count) * 2;
	$$renderer.push(`<p>${$.escape($.store_get($$store_subs ??= {}, "$count", count))} ${$.escape(doubled)} ${$.escape($.store_get($$store_subs ??= {}, "$later", later))}</p>`);
	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}
