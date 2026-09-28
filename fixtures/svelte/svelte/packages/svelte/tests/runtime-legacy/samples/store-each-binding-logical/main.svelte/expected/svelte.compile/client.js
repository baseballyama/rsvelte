import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

var root = $.from_html(`<input/>`);
var root_1 = $.from_html(`<!> <p> </p>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $items = () => $.store_get(items, '$items', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const items = writable([{ id: 0, text: 'initial' }]);
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.each(node, 1, () => $items() ?? [], $.index, ($$anchor, item, $$index) => {
		var input = root();

		$.remove_input_defaults(input);

		$.bind_value(input, () => $.get(item).text, ($$value) => (
			$.get(item).text = $$value,
			$.invalidate_store($$stores, '$items')
		));

		$.append($$anchor, input);
	});

	var p = $.sibling(node, 2);
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, $items()[0].text));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}