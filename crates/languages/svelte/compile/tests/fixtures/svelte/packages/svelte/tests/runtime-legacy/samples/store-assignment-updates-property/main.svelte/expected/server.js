import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const a = writable({ foo: 1, bar: 2 });

		$.store_mutate($$store_subs ??= {}, '$a', a, $.store_get($$store_subs ??= {}, '$a', a).foo = 3);

		const b = writable({ foo: 1, bar: 2 });

		$.store_set(b, { foo: 3 });

		function update() {
			$.store_mutate($$store_subs ??= {}, '$a', a, $.store_get($$store_subs ??= {}, '$a', a).foo = $.store_get($$store_subs ??= {}, '$a', a).foo + 1);

			$.store_set(b, {
				foo: $.store_get($$store_subs ??= {}, '$b', b).foo + 1,
				qux: 0
			});
		}

		$$renderer.push(`<p>a: ${$.escape(JSON.stringify($.store_get($$store_subs ??= {}, '$a', a)))}</p> <p>b: ${$.escape(JSON.stringify($.store_get($$store_subs ??= {}, '$b', b)))}</p> <button></button> <button></button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}