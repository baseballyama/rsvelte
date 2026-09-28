import * as $ from 'svelte/internal/server';
import UI from '../ui';

export default function Switch($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { field, entry, onchange } = $$props;

		$$renderer.push(`<div class="svelte-1cpp05m">`);

		if (UI.Switch) {
			$$renderer.push('<!--[-->');

			UI.Switch($$renderer, {
				label: field.label,
				field,
				value: entry?.value ?? false,
				oninput: (value) => onchange({ [field.key]: { 0: { value } } })
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div>`);
	});
}