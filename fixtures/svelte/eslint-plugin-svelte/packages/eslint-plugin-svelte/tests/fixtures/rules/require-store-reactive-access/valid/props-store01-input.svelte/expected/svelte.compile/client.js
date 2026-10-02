import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MyComponent from './MyComponent.svelte';
import { writable } from 'svelte/store';

var root = $.from_html(`<!> <!> <!> <!> <!> <svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper>`, 1);

export default function Props_store01_input($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get(store, '$store', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let store = writable('hello');
	var fragment = root();
	var node = $.first_child(fragment);

	MyComponent(node, {
		get prop() {
			return store;
		}
	});

	var node_1 = $.sibling(node, 2);

	MyComponent(node_1, {
		get store() {
			return store;
		}
	});

	var node_2 = $.sibling(node_1, 2);

	MyComponent(node_2, {
		get value() {
			return store;
		},

		set value($$value) {
			store = $$value;
		}
	});

	var node_3 = $.sibling(node_2, 2);

	MyComponent(node_3, {
		get store() {
			return store;
		},

		set store($$value) {
			store = $$value;
		}
	});

	var node_4 = $.sibling(node_3, 2);

	$.bind_this(MyComponent(node_4, {}), ($$value) => $.store_set(store, $$value), () => $store());

	var node_5 = $.sibling(node_4, 2);

	{
		$.css_props(node_5, () => ({ '--my-style-var': $store() }));
		MyComponent(node_5.lastChild, {});
		$.reset(node_5);
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}