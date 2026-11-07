import * as $ from 'svelte/internal/server';
import { store } from './store';

export default function Main($$renderer) {
	var $$store_subs;

	$$renderer.push(`<h1>${$.escape($.store_get($$store_subs ??= {}, '$store', store))}</h1>`);

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}