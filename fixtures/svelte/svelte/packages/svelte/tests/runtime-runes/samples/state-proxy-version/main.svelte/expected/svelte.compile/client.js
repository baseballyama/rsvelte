import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext } from 'svelte';
import Item from './Item.svelte';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let items = $.proxy({});

	setContext('container', {
		register: (id) => items[id] = true,
		unregister: (id) => delete items[id]
	});

	Item($$anchor, {});
	$.pop();
}