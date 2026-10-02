import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Svelte_element01_input($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get(store, '$store', $$stores);
	const $div = () => $.store_get(div, '$div', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let store = writable('hello');
	let value = writable('hello');
	let div = writable('div');
	let input = writable('input');
	var fragment = root();
	var node = $.first_child(fragment);

	$.element(node, $div, false, ($$element, $$anchor) => {
		$.attribute_effect($$element, () => ({ prop: `Hello ${$store() ?? ''}` }));
	});

	var node_1 = $.sibling(node, 2);

	$.element(node_1, $div, false, ($$element_1, $$anchor) => {
		$.attribute_effect($$element_1, () => ({ prop: $store() }));
	});

	var node_2 = $.sibling(node_1, 2);

	$.element(node_2, $div, false, ($$element_2, $$anchor) => {
		$.attribute_effect($$element_2, () => ({ ...$store() }));
	});

	var node_3 = $.sibling(node_2, 2);

	$.element(node_3, $div, false, ($$element_3, $$anchor) => {
		$.bind_this($$element_3, ($$value) => $.store_set(store, $$value), () => $store());
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}