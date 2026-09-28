import * as $ from 'svelte/internal/server';
import UI from '../ui';

export default function Date_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { field, entry, onchange } = $$props;

		// Format date as YYYY-MM-DD for the input
		const format_date = (value) => {
			if (!value) return '';

			const date = typeof value === 'string' ? new Date(value) : value;

			if (isNaN(date.getTime())) return '';

			return date.toISOString().split('T')[0];
		};

		const formatted_value = $.derived(() => format_date(entry?.value));

		$$renderer.push(`<div class="svelte-rrz7ta">`);

		if (UI.TextInput) {
			$$renderer.push('<!--[-->');

			UI.TextInput($$renderer, $.spread_props([
				field,
				{
					value: formatted_value(),
					oninput: (text) => onchange({ [field.key]: { 0: { value: text } } }),
					type: 'date'
				}
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div>`);
	});
}