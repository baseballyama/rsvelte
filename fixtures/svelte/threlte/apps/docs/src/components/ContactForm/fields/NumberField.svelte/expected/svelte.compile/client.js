import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Field from './Field.svelte';

var root = $.from_html(`<input type="number"/>`);

export default function NumberField($$anchor, $$props) {
	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => $$props.label.toLowerCase().replace(' ', '-')),
		required = $.prop($$props, 'required', 3, false),
		value = $.prop($$props, 'value', 15, undefined);

	Field($$anchor, {
		get label() {
			return $$props.label;
		},

		get id() {
			return id();
		},

		get required() {
			return required();
		},

		children: ($$anchor, $$slotProps) => {
			var input = root();

			$.remove_input_defaults(input);

			$.template_effect(() => {
				$.set_attribute(input, 'name', id());
				input.required = required();
			});

			$.bind_value(input, value);
			$.append($$anchor, input);
		},
		$$slots: { default: true }
	});

	$.pop();
}