import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MyComponent from './MyComponent.svelte';
import { writable } from 'svelte/store';

var root = $.from_html(`<!> <!> <svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper> <!>`, 1);

export default function Props_store01_output($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get(store, '$store', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let store = writable('hello');
	var fragment = root();
	var node = $.first_child(fragment);

	MyComponent(node, {
		get prop() {
			return `Hello ${$store() ?? ''}`;
		}
	});

	var node_1 = $.sibling(node, 2);

	$.bind_this(MyComponent(node_1, {}), ($$value) => $.store_set(store, $$value), () => $store());

	var node_2 = $.sibling(node_1, 2);

	{
		$.css_props(node_2, () => ({ '--my-style-var': $store() }));
		MyComponent(node_2.lastChild, {});
		$.reset(node_2);
	}

	var node_3 = $.sibling(node_2, 2);

	MyComponent(node_3, $.spread_props($store));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}