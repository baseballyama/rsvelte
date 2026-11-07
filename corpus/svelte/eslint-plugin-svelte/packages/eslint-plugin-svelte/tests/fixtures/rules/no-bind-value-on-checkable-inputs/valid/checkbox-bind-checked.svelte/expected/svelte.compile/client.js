import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="checkbox"/> `, 1);

export default function Checkbox_bind_checked($$anchor) {
	let checked = $.state(true);
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);
	input.value = input.__value = 'irrelevant';

	var text = $.sibling(input);

	$.template_effect(() => $.set_text(text, ` ${$.get(checked) ?? ''}`));
	$.bind_checked(input, () => $.get(checked), ($$value) => $.set(checked, $$value));
	$.append($$anchor, fragment);
}