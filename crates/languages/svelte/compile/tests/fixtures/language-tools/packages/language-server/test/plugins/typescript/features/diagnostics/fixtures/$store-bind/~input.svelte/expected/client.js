import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';
import { Component } from './components';

var root = $.from_html(`<div></div> <!> <div></div> <!> <div></div> <!> <div></div> <!>`, 1);

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	const $storeNr = () => $.store_get(storeNr, '$storeNr', $$stores);
	const $storeObjNr = () => $.store_get(storeObjNr, '$storeObjNr', $$stores);
	const $storeBool = () => $.store_get(storeBool, '$storeBool', $$stores);
	const $storeObjBool = () => $.store_get(storeObjBool, '$storeObjBool', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const storeNr = writable(1);
	const storeBool = writable(true);
	const storeObjNr = writable({ foo: 1 });
	const storeObjBool = writable({ foo: true });
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.sibling(div, 2);

	Component(node, {
		get prop() {
			$.mark_store_binding();

			return $storeNr();
		},

		set prop($$value) {
			$.store_set(storeNr, $$value);
		}
	});

	var div_1 = $.sibling(node, 2);
	var node_1 = $.sibling(div_1, 2);

	Component(node_1, {
		get prop() {
			return $storeObjNr().foo;
		},

		set prop($$value) {
			$.store_mutate(storeObjNr, $.untrack($storeObjNr).foo = $$value, $.untrack($storeObjNr));
		}
	});

	var div_2 = $.sibling(node_1, 2);
	var node_2 = $.sibling(div_2, 2);

	Component(node_2, {
		get prop() {
			$.mark_store_binding();

			return $storeBool();
		},

		set prop($$value) {
			$.store_set(storeBool, $$value);
		}
	});

	var div_3 = $.sibling(node_2, 2);
	var node_3 = $.sibling(div_3, 2);

	Component(node_3, {
		get prop() {
			return $storeObjBool().foo;
		},

		set prop($$value) {
			$.store_mutate(storeObjBool, $.untrack($storeObjBool).foo = $$value, $.untrack($storeObjBool));
		}
	});

	$.bind_element_size(div, 'offsetHeight', ($$value) => $.store_set(storeNr, $$value));
	$.bind_element_size(div_1, 'offsetHeight', ($$value) => $.store_mutate(storeObjNr, $.untrack($storeObjNr).foo = $$value, $.untrack($storeObjNr)));
	$.bind_element_size(div_2, 'offsetHeight', ($$value) => $.store_set(storeBool, $$value));
	$.bind_element_size(div_3, 'offsetHeight', ($$value) => $.store_mutate(storeObjBool, $.untrack($storeObjBool).foo = $$value, $.untrack($storeObjBool)));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}