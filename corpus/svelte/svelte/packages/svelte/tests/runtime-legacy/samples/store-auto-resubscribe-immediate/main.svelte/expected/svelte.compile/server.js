import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let value = writable({ foo: 1, bar: 2 });

		$.store_mutate($$store_subs ??= {}, '$value', value, $.store_get($$store_subs ??= {}, '$value', value).foo = $.store_get($$store_subs ??= {}, '$value', value).foo + $.store_get($$store_subs ??= {}, '$value', value).bar); // 3
		$.store_mutate($$store_subs ??= {}, '$value', value, $.store_get($$store_subs ??= {}, '$value', value).bar = $.store_get($$store_subs ??= {}, '$value', value).foo * $.store_get($$store_subs ??= {}, '$value', value).bar); // 6

		// should resubscribe immediately
		value = writable({
			foo: $.store_get($$store_subs ??= {}, '$value', value).foo + 2,
			bar: $.store_get($$store_subs ??= {}, '$value', value).bar - 2
		}); // { foo: 5, bar: 4 }

		// should mutate the store value
		$.store_mutate($$store_subs ??= {}, '$value', value, $.store_get($$store_subs ??= {}, '$value', value).baz = $.store_get($$store_subs ??= {}, '$value', value).foo + $.store_get($$store_subs ??= {}, '$value', value).bar); // { foo: 5, bar: 4, baz: 9 }

		// should resubscribe immediately
		value = writable({
			qux: $.store_get($$store_subs ??= {}, '$value', value).baz - $.store_get($$store_subs ??= {}, '$value', value).foo
		}); // { qux: 4 }

		// making sure instrumentation returns the expression value
		$.store_set(value, {
			one: writable($.store_set(value, {
				two: (($$value) => {
					$.store_set(value, $$value.$value);

					return $$value;
				})({
					$value: { fred: $.store_get($$store_subs ??= {}, '$value', value).qux }
				})
			}))
		});

		const one = $.store_get($$store_subs ??= {}, '$value', value).one;

		value.update((val) => ({
			answer: $.store_get($$store_subs ??= {}, '$one', one).two.$value.fred
		}));

		$$renderer.push(`<!---->${$.escape(JSON.stringify($.store_get($$store_subs ??= {}, '$value', value)))}`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}