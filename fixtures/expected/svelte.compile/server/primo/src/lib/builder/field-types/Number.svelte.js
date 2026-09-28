import * as $ from 'svelte/internal/server';
import UI from '../ui';

export default function Number($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { field, entry, onchange } = $$props;

		$$renderer.push(`<div class="svelte-1cqjwkz">`);

		if (UI.TextInput) {
			$$renderer.push('<!--[-->');

			UI.TextInput($$renderer, $.spread_props([
				field,
				{
					value: entry?.value ?? '',
					oninput: (text) => onchange({ [field.key]: { 0: { value: parseFloat(text) || 0 } } }),
					type: 'number'
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