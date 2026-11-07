import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/> `, 1);

export default function $derived_input($$anchor) {
	let x = { foo: 42 };
	const get = () => "hello";

	x = null;

	const y = $.derived(() => x);
	const z = $.derived(() => fn($.get(y).foo));
	const foo = $.derived(() => get);

	function fn(a) {
		return a;
	}

	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var text = $.sibling(input);

	$.template_effect(
		($0) => {
			$.set_attribute(input, 'title', $.get(z));
			$.set_text(text, ` ${$0 ?? ''}`);
		},
		[() => $.get(foo)()]
	);

	$.bind_value(input, () => x, ($$value) => x = $$value);
	$.append($$anchor, fragment);
}