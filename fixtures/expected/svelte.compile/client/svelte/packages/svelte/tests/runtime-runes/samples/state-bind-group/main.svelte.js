import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="checkbox"/>`);
var root_1 = $.from_html(`<button>+</button> <!> `, 1);

export default function Main($$anchor) {
	const binding_group = [];
	let checkboxes = $.state($.proxy([]));
	let values = ['1', '2', '3'];
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.each(node, 17, () => values, $.index, ($$anchor, val) => {
		var input = root();

		$.remove_input_defaults(input);

		var input_value;

		$.template_effect(() => {
			if (input_value !== (input_value = $.get(val))) {
				input.value = (input.__value = input_value) ?? '';
			}
		});

		$.bind_group(
			binding_group,
			[],
			input,
			() => {
				$.get(val);

				return $.get(checkboxes);
			},
			($$value) => $.set(checkboxes, $$value)
		);

		$.append($$anchor, input);
	});

	var text = $.sibling(node);

	$.template_effect(($0) => $.set_text(text, ` ${$0 ?? ''}`), [() => JSON.stringify($.get(checkboxes))]);
	$.delegated('click', button, () => $.get(checkboxes).push('2'));
	$.append($$anchor, fragment);
}

$.delegate(['click']);