import * as $ from 'svelte/internal/server';
import { Writable, Readable } from 'svelte/store';

export default function Ts_store03_type_output($$renderer, $$props) {
	var $$store_subs;

	// Writable: any, Writable: any, Readable: any, Readable: any
	let maybeUndef; // maybeUndef: Writable<number> | undefined

	let maybeNull; // maybeNull: Readable<string> | null
	let maybeNullAndStr; // maybeNullAndStr: string | Readable<boolean> | null

	function fn() {
		// fn: () => void
		$.store_get($$store_subs ??= {}, '$maybeUndef', maybeUndef); // $maybeUndef: number | undefined

		$.store_get($$store_subs ??= {}, '$maybeNull', maybeNull); // $maybeNull: string | null
		$.store_get($$store_subs ??= {}, '$maybeNullAndStr', maybeNullAndStr); // $maybeNullAndStr: string | boolean | null
	}

	$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$maybeUndef', maybeUndef))} ${$.escape($.store_get($$store_subs ??= {}, '$maybeNull', maybeNull))} ${$.escape($.store_get($$store_subs ??= {}, '$maybeNullAndStr', maybeNullAndStr))}`);

	if ($$store_subs) $.unsubscribe_stores($$store_subs);

	$.bind_props($$props, { fn });
}