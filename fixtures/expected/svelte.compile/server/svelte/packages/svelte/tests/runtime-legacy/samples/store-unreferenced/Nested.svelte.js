import * as $ from 'svelte/internal/server';
import { count } from './store.js';

export default function Nested($$renderer) {
	var $$store_subs;

	$$renderer.push(`<p>count: ${$.escape($.store_get($$store_subs ??= {}, '$count', count))}</p>`);

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}