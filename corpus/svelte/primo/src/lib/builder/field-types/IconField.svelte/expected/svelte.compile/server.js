import * as $ from 'svelte/internal/server';
import { watch } from 'runed';
import { loadIcon, buildIcon } from '@iconify/svelte';
import IconPicker from '../components/IconPicker.svelte';

export default function IconField($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { field, entry, onchange, search_query = '' } = $$props;
		const value = $.derived(() => entry?.value ?? '');

		// ensure value is valid
		watch(() => value(), () => {
			if (!value().startsWith('<svg')) {
				onchange({ [field.key]: { 0: { value: '' } } });
			}
		});

		async function select_icon(icon) {
			// delete icon
			if (!icon) {
				onchange({ [field.key]: { 0: { value: '' } } });

				return;
			}

			// select icon
			const icon_data = await loadIcon(icon);

			if (icon_data) {
				const { attributes } = buildIcon(icon_data);
				const svg = `<svg xmlns="http://www.w3.org/2000/svg" data-key="${field.key}" data-icon="${icon}" aria-hidden="true" role="img" height="${attributes.height}" width="${attributes.width}" viewBox="${attributes.viewBox}">${icon_data.body}</svg>`;

				onchange({ [field.key]: { 0: { value: svg } } });
			}
		}

		$$renderer.push(`<div class="IconPicker">`);

		if (field.label) {
			$$renderer.push(`<!--[0--><p class="primo--field-label">${$.escape(field.label)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		IconPicker($$renderer, { svg_preview: value(), search_query });
		$$renderer.push(`<!----></div>`);
	});
}