import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { store } from './state.js';
import Child from './Child.svelte';

var root = $.from_html(`<!> <button>1</button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get(store, '$store', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var fragment = root();
	var node = $.first_child(fragment);

	Child(node, {
		get value() {
			return $store().value;
		}
	});

	var button = $.sibling(node, 2);

	$.event('click', button, () => store.set({ value: 1 }));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}