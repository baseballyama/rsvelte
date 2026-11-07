import * as $ from 'svelte/internal/server';
import store from './store.js';

export default function Fixer_test01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		$$renderer.push(`<!---->$foo: ${$.escape($.store_get($$store_subs ??= {}, '$store', store).$foo)}
bar: ${$.escape($.store_get($$store_subs ??= {}, '$store', store).bar)}
baz: ${$.escape($.store_get($$store_subs ??= {}, '$store', store).baz)}
var: ${$.escape($.store_get($$store_subs ??= {}, '$store', store).var)}
null: ${$.escape($.store_get($$store_subs ??= {}, '$store', store).null)}
undefined: ${$.escape($.store_get($$store_subs ??= {}, '$store', store).undefined)}`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}