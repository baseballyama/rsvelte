import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import UI from '../ui';

var root = $.from_html(`<div class="svelte-rrz7ta"><!></div>`);

export default function Date_1($$anchor, $$props) {
	$.push($$props, true);

	// Format date as YYYY-MM-DD for the input
	const format_date = (value) => {
		if (!value) return '';

		const date = typeof value === 'string' ? new Date(value) : value;

		if (isNaN(date.getTime())) return '';

		return date.toISOString().split('T')[0];
	};

	const formatted_value = $.derived(() => format_date($$props.entry?.value));
	var div = root();
	var node = $.child(div);

	$.component(node, () => UI.TextInput, ($$anchor, UI_TextInput) => {
		UI_TextInput($$anchor, $.spread_props(() => $$props.field, {
			get value() {
				return $.get(formatted_value);
			},
			oninput: (text) => $$props.onchange({ [$$props.field.key]: { 0: { value: text } } }),
			type: 'date'
		}));
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}