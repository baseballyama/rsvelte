import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $foo = () => $.store_get(foo, '$foo', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	function fake_observable(store) {
		return { subscribe: (cb) => ({ unsubscribe: store.subscribe(cb) }) };
	}

	let foo = fake_observable(writable(0));

	foo = fake_observable(writable(42));
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, $foo()));
	$.append($$anchor, text);
	$.pop();
	$$cleanup();
}