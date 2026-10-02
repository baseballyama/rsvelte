import * as $ from 'svelte/internal/server';
import { imported, createStore } from './store.js';

export default function Unused_write_only_store_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const writeOnly = createStore();

		$.store_set(writeOnly, 99);

		const readOnly = createStore();

		$.store_get($$store_subs ??= {}, '$readOnly', readOnly);
		$.store_set(imported, 'some value');
		$$renderer.push(`<div></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}