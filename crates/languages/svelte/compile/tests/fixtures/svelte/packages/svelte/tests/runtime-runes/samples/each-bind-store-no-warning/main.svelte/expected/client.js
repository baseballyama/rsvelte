import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

var root = $.from_html(`<div><input/></div>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $array = () => $.store_get(array, '$array', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const array = writable([{ name: "" }]);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 1, $array, $.index, ($$anchor, item, $$index) => {
		var div = root();
		var input = $.child(div);

		$.remove_input_defaults(input);
		$.reset(div);

		$.bind_value(input, () => $.get(item).name, ($$value) => (
			$.get(item).name = $$value,
			$.invalidate_store($$stores, '$array')
		));

		$.append($$anchor, div);
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}