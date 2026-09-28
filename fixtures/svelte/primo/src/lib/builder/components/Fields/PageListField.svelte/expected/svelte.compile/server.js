import * as $ from 'svelte/internal/server';
import UI from '../../ui/index.js';
import { site_context } from '$lib/builder/stores/context';
import { createEventDispatcher } from 'svelte';

export default function PageListField($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const dispatch = createEventDispatcher();
		const { value: site } = site_context.getOr({ value: null });
		const { field } = $$props;

		$$renderer.push(`<div class="PagesField"><div class="container svelte-yy6369">`);

		if (UI.Select) {
			$$renderer.push('<!--[-->');

			UI.Select($$renderer, {
				label: 'Page Type',
				value: field.config?.page_type || '',
				fullwidth: true,
				options: site?.page_types()?.map((page_type) => ({
					label: page_type.name,
					value: page_type.id,
					icon: page_type.icon
				}))
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div></div>`);
	});
}