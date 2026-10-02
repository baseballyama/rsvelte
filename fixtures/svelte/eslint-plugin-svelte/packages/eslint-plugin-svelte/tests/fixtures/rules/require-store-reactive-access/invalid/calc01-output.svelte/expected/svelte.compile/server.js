import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Calc01_output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let store = writable(42);
		const constStore = writable('hello');

		// UpdateExpression
		console.log($.update_store($$store_subs ??= {}, '$store', store));

		console.log($.update_store($$store_subs ??= {}, '$store', store, -1));
		console.log($.update_store_pre($$store_subs ??= {}, '$store', store));
		console.log($.update_store_pre($$store_subs ??= {}, '$store', store, -1));

		// UnaryExpression
		console.log(-$.store_get($$store_subs ??= {}, '$store', store));

		// eslint-disable-next-line no-implicit-coercion -- test
		console.log(+$.store_get($$store_subs ??= {}, '$store', store));

		console.log(!store);
		console.log(~$.store_get($$store_subs ??= {}, '$store', store));
		console.log(typeof store);
		console.log(!$.store_get($$store_subs ??= {}, '$constStore', constStore));
		console.log(typeof $.store_get($$store_subs ??= {}, '$constStore', constStore));

		let foo = 1;

		// AssignmentExpression
		store = writable(42);

		$.store_set(store, $.store_get($$store_subs ??= {}, '$store', store) + 42);
		foo += $.store_get($$store_subs ??= {}, '$store', store);
		foo = store;

		// BinaryExpression
		console.log($.store_get($$store_subs ??= {}, '$store', store) + 42);

		console.log(42 + $.store_get($$store_subs ??= {}, '$store', store));
		console.log(store == null);
		console.log(store != null);
		console.log(store === null);
		console.log(store !== null);
		console.log($.store_get($$store_subs ??= {}, '$constStore', constStore) == null);
		console.log($.store_get($$store_subs ??= {}, '$constStore', constStore) != null);
		console.log($.store_get($$store_subs ??= {}, '$constStore', constStore) === null);
		console.log($.store_get($$store_subs ??= {}, '$constStore', constStore) !== null);

		// LogicalExpression
		console.log(store && foo);

		console.log($.store_get($$store_subs ??= {}, '$constStore', constStore) || foo);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}