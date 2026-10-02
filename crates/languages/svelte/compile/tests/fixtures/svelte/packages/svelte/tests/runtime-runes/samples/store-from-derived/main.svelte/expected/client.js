import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get($.get(store), '$store', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let data = { store: writable(false) };
	let store = $.derived(() => data.store);
	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, $store()));
	$.delegated('click', button, () => $.store_set($.get(store), true));
	$.append($$anchor, button);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);