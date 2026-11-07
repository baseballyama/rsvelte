import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable, Writable } from 'svelte/store';

var root = $.from_html(`<div></div> <div></div> <div></div> <div></div> <div></div>`, 1);

export default function Ts_class_directives01_output($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get(store, '$store', $$stores);
	const $constStore = () => $.store_get(constStore, '$constStore', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let store = null;
	const constStore = writable('hello');
	var fragment = root();
	var div = $.first_child(fragment);
	let styles;
	var div_1 = $.sibling(div, 2);
	let classes;
	var div_2 = $.sibling(div_1, 2);
	let classes_1;
	var div_3 = $.sibling(div_2, 2);

	$.set_class(div_3, 1, '', null, {}, { name: store });

	var div_4 = $.sibling(div_3, 2);

	$.set_class(div_4, 1, '', null, {}, { store });

	$.template_effect(() => {
		styles = $.set_style(div, '', styles, { color: $store() });
		classes = $.set_class(div_1, 1, '', null, classes, { name: $constStore() });
		classes_1 = $.set_class(div_2, 1, '', null, classes_1, { constStore });
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}