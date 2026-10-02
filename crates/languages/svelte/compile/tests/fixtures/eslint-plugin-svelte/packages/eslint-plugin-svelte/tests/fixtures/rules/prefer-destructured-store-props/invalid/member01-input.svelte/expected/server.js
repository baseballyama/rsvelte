import * as $ from 'svelte/internal/server';
import store from './store.js';

export default function Member01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		$$renderer.push(`<!---->foo.bar: ${$.escape($.store_get($$store_subs ??= {}, '$store', store).foo.bar)}
foo.baz: ${$.escape($.store_get($$store_subs ??= {}, '$store', store).foo.baz)}`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}