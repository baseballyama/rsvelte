import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

var root = $.from_html(`<input/>`);
var root_1 = $.from_html(`<!> <p> </p>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $itemStore = () => $.store_get(itemStore, '$itemStore', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let itemStore = writable({ prop: { things: [{ name: "item store" }] } });
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.each(node, 1, () => $itemStore().prop.things, $.index, ($$anchor, thing, $$index) => {
		var input = root();

		$.remove_input_defaults(input);

		$.bind_value(input, () => $.get(thing).name, ($$value) => (
			$.get(thing).name = $$value,
			$.invalidate_store($$stores, '$itemStore')
		));

		$.append($$anchor, input);
	});

	var p = $.sibling(node, 2);
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, $itemStore().prop.things[0].name));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}