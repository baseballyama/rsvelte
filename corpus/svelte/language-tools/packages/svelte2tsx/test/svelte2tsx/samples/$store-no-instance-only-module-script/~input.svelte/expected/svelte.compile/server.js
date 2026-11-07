import * as $ from 'svelte/internal/server';
import { store1 } from './somewhere';

const store2 = '';

export default function Input($$renderer) {
	var $$store_subs;

	$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$store1', store1))}
${$.escape($.store_get($$store_subs ??= {}, '$store2', store2))}`);

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}