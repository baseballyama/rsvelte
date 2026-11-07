import * as $ from 'svelte/internal/server';
import { store1, store2 } from './store';

const store3 = writable('');
const store4 = writable('');

export default function Input($$renderer) {
	var $$store_subs;

	$.store_get($$store_subs ??= {}, '$store1', store1);
	$.store_get($$store_subs ??= {}, '$store3', store3);
	$$renderer.push(`<p>${$.escape($.store_get($$store_subs ??= {}, '$store2', store2))}</p> <p>${$.escape($.store_get($$store_subs ??= {}, '$store4', store4))}</p>`);

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}