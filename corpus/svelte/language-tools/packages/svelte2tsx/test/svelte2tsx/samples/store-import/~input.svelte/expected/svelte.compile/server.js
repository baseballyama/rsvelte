import * as $ from 'svelte/internal/server';
import storeA from './store';
import { storeB } from './store';
import { storeB as storeC } from './store';

export default function Input($$renderer) {
	var $$store_subs;

	$$renderer.push(`<p>${$.escape($.store_get($$store_subs ??= {}, '$storeA', storeA))}</p> <p>${$.escape($.store_get($$store_subs ??= {}, '$storeB', storeB))}</p> <p>${$.escape($.store_get($$store_subs ??= {}, '$storeC', storeC))}</p>`);

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}