import * as $ from 'svelte/internal/server';
import { store } from './foo';
import { store2 } from './foo';

export default function Input($$renderer) {
	var $$store_subs;

	function _foo($$renderer) {
		$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$store', store))}`);
	}

	function _foo2($$renderer) {
		$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$store2', store2))}`);
	}

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}