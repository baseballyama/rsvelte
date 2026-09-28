import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { as_value_form } from './form.remote';

var root = $.from_html(`<form><input/> <input/> <input/> <input/> <input/> <select><option>apple</option><option>banana</option><option>cherry</option></select> <input/> <input/> <label>Checkbox <input/></label> <button>submit</button></form>`);

export default function Form($$anchor, $$props) {
	$.push($$props, true);

	const form = $.derived(() => as_value_form.for($$props.value.id));
	var form_1 = root();

	$.attribute_effect(form_1, () => ({ class: 'form', ...$.get(form) }), void 0, void 0, void 0, 'svelte-ukzv7l');

	var input = $.child(form_1);

	$.attribute_effect(
		input,
		($0) => ({ ...$0 }),
		[
			() => $.get(form).fields.hidden.string.as('hidden', 'string')
		],
		void 0,
		void 0,
		'svelte-ukzv7l',
		true
	);

	var input_1 = $.sibling(input, 2);

	$.attribute_effect(input_1, ($0) => ({ ...$0 }), [() => $.get(form).fields.hidden.number.as('hidden', 1)], void 0, void 0, 'svelte-ukzv7l', true);

	var input_2 = $.sibling(input_1, 2);

	$.attribute_effect(input_2, ($0) => ({ ...$0 }), [() => $.get(form).fields.hidden.boolean.as('hidden', true)], void 0, void 0, 'svelte-ukzv7l', true);

	var input_3 = $.sibling(input_2, 2);

	$.attribute_effect(
		input_3,
		($0) => ({ ...$0 }),
		[
			() => $.get(form).fields.text_field.as('text', $$props.value.text_field)
		],
		void 0,
		void 0,
		'svelte-ukzv7l',
		true
	);

	var input_4 = $.sibling(input_3, 2);

	$.attribute_effect(
		input_4,
		($0) => ({ ...$0 }),
		[
			() => $.get(form).fields.number_field.as('number', $$props.value.number_field)
		],
		void 0,
		void 0,
		'svelte-ukzv7l',
		true
	);

	var select = $.sibling(input_4, 2);

	$.attribute_effect(
		select,
		($0) => ({ ...$0 }),
		[
			() => $.get(form).fields.select_field.as('select', $$props.value.select_field)
		],
		void 0,
		void 0,
		'svelte-ukzv7l'
	);

	var input_5 = $.sibling(select, 2);

	$.attribute_effect(
		input_5,
		($0) => ({ ...$0 }),
		[
			() => $.get(form).fields.color_field.as('color', $$props.value.color_field)
		],
		void 0,
		void 0,
		'svelte-ukzv7l',
		true
	);

	var input_6 = $.sibling(input_5, 2);

	$.attribute_effect(
		input_6,
		($0) => ({ ...$0 }),
		[
			() => $.get(form).fields.range_field.as('range', $$props.value.range_field)
		],
		void 0,
		void 0,
		'svelte-ukzv7l',
		true
	);

	var label = $.sibling(input_6, 2);
	var input_7 = $.sibling($.child(label));

	$.attribute_effect(
		input_7,
		($0) => ({ ...$0 }),
		[
			() => $.get(form).fields.checkbox_field.as('checkbox', $$props.value.checkbox_field)
		],
		void 0,
		void 0,
		'svelte-ukzv7l',
		true
	);

	$.reset(label);

	var button = $.sibling(label, 2);

	$.attribute_effect(button, ($0) => ({ ...$0 }), [() => $.get(form).fields.id.as('submit', $$props.value.id)], void 0, void 0, 'svelte-ukzv7l');
	$.reset(form_1);
	$.append($$anchor, form_1);
	$.pop();
}