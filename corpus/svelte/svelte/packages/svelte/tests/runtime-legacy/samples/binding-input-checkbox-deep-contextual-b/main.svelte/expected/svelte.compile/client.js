import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><input type="checkbox"/> <p> </p></div>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let todos = [
		{ done: false, text: 'one' },
		{ done: false, text: 'two' },
		{ done: false, text: 'three' }
	];

	function clear() {
		todos = todos.filter((t) => !t.done);
	}

	var $$exports = { clear };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => todos, $.index, ($$anchor, todo, i) => {
		var div = root();
		var input = $.child(div);

		$.remove_input_defaults(input);

		var p = $.sibling(input, 2);
		var text = $.only_child(p, true);

		$.reset(div);
		$.template_effect(() => $.set_text(text, $.get(todo).text));
		$.bind_checked(input, () => $.get(todo).done, ($$value) => ($.get(todo).done = $$value));
		$.append($$anchor, div);
	});

	$.append($$anchor, fragment);

	return $.pop($$exports);
}