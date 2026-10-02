import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

var root = $.from_html(`<div></div> <div></div> <div></div> <div></div>`, 1);

export default function Attrs_store01_input($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get(store, '$store', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let store = writable('hello');
	let value = writable('hello');
	var fragment = root();
	var div = $.first_child(fragment);
	var div_1 = $.sibling(div, 2);
	var div_2 = $.sibling(div_1, 2);

	$.attribute_effect(div_2, () => ({ ...$store() }));

	var div_3 = $.sibling(div_2, 2);

	$.bind_this(div_3, ($$value) => $.store_set(store, $$value), () => $store());

	$.template_effect(() => {
		$.set_attribute(div, 'prop', `Hello ${$store() ?? ''}`);
		$.set_attribute(div_1, 'prop', $store());
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}