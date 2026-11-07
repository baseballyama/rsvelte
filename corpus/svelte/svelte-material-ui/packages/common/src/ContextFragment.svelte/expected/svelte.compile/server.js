import * as $ from 'svelte/internal/server';
import { onDestroy, setContext } from 'svelte';
import { writable } from 'svelte/store';

export default function ContextFragment($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { key, value, children } = $$props;

		// svelte-ignore state_referenced_locally
		const storeValue = writable(value);

		// svelte-ignore state_referenced_locally
		setContext(key, storeValue);

		onDestroy(() => {
			storeValue.set(undefined);
		});

		children?.($$renderer);
		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}