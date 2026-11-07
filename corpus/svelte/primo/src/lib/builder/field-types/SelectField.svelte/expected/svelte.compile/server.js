import * as $ from 'svelte/internal/server';
import UI from '../ui';

export default function SelectField($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { field, entry, onchange } = $$props;
		const value = $.derived(() => entry?.value);
		const options = $.derived(() => field.config?.options || []);

		// Track if we've auto-selected to prevent repeated calls
		let has_auto_selected = false;

		$$renderer.push(`<div class="SelectField svelte-1hoyptm">`);

		if (// Auto-select first option if no value is set (runs once when field has options and key)
		options().length > 0) {
			$$renderer.push('<!--[0-->');

			if (UI.Select) {
				$$renderer.push('<!--[-->');

				UI.Select($$renderer, {
					fullwidth: true,
					label: field.label,
					options: options(),
					value: value(),
					disable_auto_highlight: true
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else {
			$$renderer.push(`<!--[-1--><span>This field doesn't have any options</span>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}