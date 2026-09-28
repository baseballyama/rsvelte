import * as $ from 'svelte/internal/server';
import UI from '../ui';

export default function Text($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { field, entry, onchange } = $$props;

		$$renderer.push(`<div class="svelte-1bz40y5">`);

		if (UI.TextInput) {
			$$renderer.push('<!--[-->');

			UI.TextInput($$renderer, $.spread_props([
				field,
				{
					value: entry?.value ?? '',
					oninput: (text) => onchange({ [field.key]: { 0: { value: text } } })
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