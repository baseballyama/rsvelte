import * as $ from 'svelte/internal/server';
import { fromStore, writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let isLoading = false;
		const value = writable(0);
		const valueFromStore = fromStore(value);
		const valueDerivedCurrent = $.derived(() => valueFromStore.current);

		$$renderer.push(`<div>$value: ${$.escape(isLoading
			? 'Loading...'
			: $.store_get($$store_subs ??= {}, '$value', value))}</div> <div>valueFromStore.current: ${$.escape(isLoading ? 'Loading...' : valueFromStore.current)}</div> <div>valueDerivedCurrent: ${$.escape(isLoading ? 'Loading...' : valueDerivedCurrent())}</div> <button>Loading</button> <button>Increment</button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}