import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';
import Child from './App.svelte';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const store_container = { store: writable('Hello World') };

	function update_value(value) {
		store_container.store = writable(value);
	}

	var $$exports = { update_value };

	Child($$anchor, {
		get store_container() {
			return store_container;
		}
	});

	return $.pop($$exports);
}