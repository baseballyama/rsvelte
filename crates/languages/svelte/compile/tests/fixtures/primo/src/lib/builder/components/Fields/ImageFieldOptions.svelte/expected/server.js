import * as $ from 'svelte/internal/server';
import UI from '../../ui/index.js';
import { createEventDispatcher } from 'svelte';

export default function ImageFieldOptions($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const dispatch = createEventDispatcher();
		let { field } = $$props;

		// Use default values from field.config or fallback to defaults
		const max_size_mb = $.derived(() => field.config?.maxSizeMB ?? 1);

		const max_width_or_height = $.derived(() => field.config?.maxWidthOrHeight ?? 1920);

		function update_config(updates) {
			const next = { ...field.config || {}, ...updates };

			dispatch('input', { config: next });
		}

		$$renderer.push(`<div class="ImageFieldOptions svelte-cllbyb"><div class="option-group svelte-cllbyb">`);

		if (UI.TextInput) {
			$$renderer.push('<!--[-->');

			UI.TextInput($$renderer, {
				type: 'number',
				label: 'Max Size (MB)',
				value: max_size_mb(),
				oninput: (value) => update_config({ maxSizeMB: Number(value) })
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div> <div class="option-group svelte-cllbyb">`);

		if (UI.TextInput) {
			$$renderer.push('<!--[-->');

			UI.TextInput($$renderer, {
				type: 'number',
				label: 'Max Dimension (px)',
				value: max_width_or_height(),
				oninput: (value) => update_config({ maxWidthOrHeight: Number(value) })
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div></div>`);
	});
}