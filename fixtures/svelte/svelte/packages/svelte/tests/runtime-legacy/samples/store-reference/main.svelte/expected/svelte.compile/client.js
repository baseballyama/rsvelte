import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get(store, '$store', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let store = writable(0);
	var button = root();
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `clicks: ${$store() ?? ''}`));

	$.delegated('click', button, () => {
		if (store && $store()) {}
	});

	$.append($$anchor, button);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);