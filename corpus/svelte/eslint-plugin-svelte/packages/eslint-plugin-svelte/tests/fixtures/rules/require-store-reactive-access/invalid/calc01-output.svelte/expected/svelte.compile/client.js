import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

export default function Calc01_output($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get(store, '$store', $$stores);
	const $constStore = () => $.store_get(constStore, '$constStore', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let store = writable(42);
	const constStore = writable('hello');

	// UpdateExpression
	console.log($.update_store(store, $store()));

	console.log($.update_store(store, $store(), -1));
	console.log($.update_pre_store(store, $store()));
	console.log($.update_pre_store(store, $store(), -1));

	// UnaryExpression
	console.log(-$store());

	// eslint-disable-next-line no-implicit-coercion -- test
	console.log(+$store());

	console.log(!store);
	console.log(~$store());
	console.log(typeof store);
	console.log(!$constStore());
	console.log(typeof $constStore());

	let foo = 1;

	// AssignmentExpression
	store = writable(42);

	$.store_set(store, $store() + 42);
	foo += $store();
	foo = store;

	// BinaryExpression
	console.log($store() + 42);

	console.log(42 + $store());
	console.log(store == null);
	console.log(store != null);
	console.log(store === null);
	console.log(store !== null);
	console.log($constStore() == null);
	console.log($constStore() != null);
	console.log($constStore() === null);
	console.log($constStore() !== null);

	// LogicalExpression
	console.log(store && foo);

	console.log($constStore() || foo);
	$.pop();
	$$cleanup();
}