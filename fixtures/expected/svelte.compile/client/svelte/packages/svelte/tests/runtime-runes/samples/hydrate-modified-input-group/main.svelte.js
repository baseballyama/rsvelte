import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="radio" name="foo"/>`);
var root_1 = $.from_html(`<!> `, 1);

export default function Main($$anchor) {
	const binding_group = [];
	let value = $.state(1);
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.each(node, 16, () => [1, 2, 3], $.index, ($$anchor, number) => {
		var input = root();

		$.remove_input_defaults(input);

		var input_value;

		$.template_effect(() => {
			if (input_value !== (input_value = number)) {
				input.value = (input.__value = input_value) ?? '';
			}
		});

		$.bind_group(
			binding_group,
			[],
			input,
			() => {
				number;

				return $.get(value);
			},
			($$value) => $.set(value, $$value)
		);

		$.append($$anchor, input);
	});

	var text = $.sibling(node);

	$.template_effect(() => $.set_text(text, ` ${$.get(value) ?? ''}`));
	$.append($$anchor, fragment);
}