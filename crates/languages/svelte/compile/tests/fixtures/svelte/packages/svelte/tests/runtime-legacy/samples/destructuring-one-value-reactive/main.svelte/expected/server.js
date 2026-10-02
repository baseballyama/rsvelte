import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let { foo, toggleFoo } = (() => {
			const foo = writable(false);

			return { foo, toggleFoo: () => foo.update((f) => !f) };
		})();

		$$renderer.push(`<button>${$.escape($.store_get($$store_subs ??= {}, '$foo', foo))}</button> <button>click handler marks foo as reactive</button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}