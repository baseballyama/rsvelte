import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

var root = $.from_html(`<h1> </h1>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $store1 = () => $.store_get(store1, '$store1', $$stores);
	const $store2 = () => $.store_get(store2, '$store2', $$stores);
	const $store3 = () => $.store_get(store3, '$store3', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let store1 = writable('store');

	let store2 = {
		subscribe: (cb) => {
			cb('...');
			cb('Hello');

			return () => {};
		}
	};

	let store3 = undefined;

	// store signal is updated during reading this, which normally errors, but shouldn't for stores
	let name = $.derived($store1);

	let hello = $.derived($store2);
	let undefined_value = $.derived($store3);
	var h1 = root();
	var text = $.only_child(h1);

	$.template_effect(() => $.set_text(text, `${$.get(hello) ?? ''} ${$.get(name) ?? ''} ${$.get(undefined_value) ?? ''}`));
	$.append($$anchor, h1);
	$.pop();
	$$cleanup();
}