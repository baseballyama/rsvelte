import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<label><input type="checkbox" name="flavours"/> </label>`);

export default function Checkbox_bind_group($$anchor) {
	const binding_group = [];
	let flavours = $.state($.proxy([]));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 16, () => ['cookies and cream', 'mint choc chip', 'raspberry ripple'], $.index, ($$anchor, flavour) => {
		var label = root();
		var input = $.child(label);

		$.remove_input_defaults(input);

		var input_value;
		var text = $.sibling(input);

		$.reset(label);

		$.template_effect(() => {
			if (input_value !== (input_value = flavour)) {
				input.value = (input.__value = input_value) ?? '';
			}

			$.set_text(text, ` ${flavour ?? ''}`);
		});

		$.bind_group(
			binding_group,
			[],
			input,
			() => {
				flavour;

				return $.get(flavours);
			},
			($$value) => $.set(flavours, $$value)
		);

		$.append($$anchor, label);
	});

	$.append($$anchor, fragment);
}