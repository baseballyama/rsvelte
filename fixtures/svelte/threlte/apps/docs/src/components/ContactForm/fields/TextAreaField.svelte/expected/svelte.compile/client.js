import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Field from './Field.svelte';

var root = $.from_html(`<textarea></textarea>`);

export default function TextAreaField($$anchor, $$props) {
	$.push($$props, true);

	let rows = $.prop($$props, 'rows', 3, 10),
		id = $.prop($$props, 'id', 19, () => $$props.label.toLowerCase().replace(' ', '-')),
		required = $.prop($$props, 'required', 3, false),
		value = $.prop($$props, 'value', 15);

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
			var textarea = root();

			$.remove_textarea_child(textarea);

			$.template_effect(() => {
				$.set_attribute(textarea, 'name', id());
				$.set_attribute(textarea, 'rows', rows());
				textarea.required = required();
			});

			$.bind_value(textarea, value);
			$.append($$anchor, textarea);
		},
		$$slots: { default: true }
	});

	$.pop();
}