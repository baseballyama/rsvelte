import * as $ from 'svelte/internal/server';
import { Writable, Readable } from 'svelte/store';

export default function Ts_store03_input($$renderer, $$props) {
	var $$store_subs;
	let maybeUndef;
	let maybeNull;
	let maybeNullAndStr;

	function fn() {
		$.store_get($$store_subs ??= {}, '$maybeUndef', maybeUndef);
		$.store_get($$store_subs ??= {}, '$maybeNull', maybeNull);
		$.store_get($$store_subs ??= {}, '$maybeNullAndStr', maybeNullAndStr);
	}

	$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$maybeUndef', maybeUndef))}
${$.escape($.store_get($$store_subs ??= {}, '$maybeNull', maybeNull))}
${$.escape($.store_get($$store_subs ??= {}, '$maybeNullAndStr', maybeNullAndStr))}`);

	if ($$store_subs) $.unsubscribe_stores($$store_subs);

	$.bind_props($$props, { fn });
}