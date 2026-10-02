import * as $ from 'svelte/internal/server';
import { name, greeting } from './stores.js';

export default function Store_bindings_input($$renderer) {
	var $$store_subs;

	$$renderer.push(`<h1>${$.escape($.store_get($$store_subs ??= {}, '$greeting', greeting))}</h1> <input${$.attr('value', $.store_get($$store_subs ??= {}, '$name', name))}/> <button>Add exclamation mark!</button>`);

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}