import * as $ from 'svelte/internal/server';
import { findMe } from './find-references-$store.svelte';

export default function Find_references_$store_other($$renderer) {
	var $$store_subs;

	if ($.store_get($$store_subs ??= {}, '$findMe', findMe)) {
		$.store_get($$store_subs ??= {}, '$findMe', findMe);
	}

	$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$findMe', findMe))}`);

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}