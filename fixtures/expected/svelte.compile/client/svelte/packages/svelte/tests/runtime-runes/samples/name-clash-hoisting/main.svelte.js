import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

var root = $.from_html(`<button>Click me</button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get(store, '$store', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const store = writable(0);

	async function logStore() {
		console.log($store());
		store.set(100);
	}

	var button = root();

	$.delegated('click', button, logStore);
	$.append($$anchor, button);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);