import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="text"/> `, 1);

export default function Main($$anchor) {
	let value = $.state('');
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var text = $.sibling(input);

	$.template_effect(() => $.set_text(text, ` ${$.get(value) ?? ''}`));
	$.bind_value(input, () => $.get(value), ($$value) => $.set(value, $$value));
	$.append($$anchor, fragment);
}