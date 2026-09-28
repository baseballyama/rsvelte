import * as $ from 'svelte/internal/server';
import { createEventDispatcher } from 'svelte';
import { site_context, page_type_context } from '$lib/builder/stores/context';
import UI from '../../ui/index.js';

export default function PageField($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { value: site } = site_context.getOr({ value: null });
		const { value: current_page_type } = page_type_context.getOr({ value: null });
		const { field } = $$props;
		const dispatch = createEventDispatcher();

		const pageTypes = $.derived(() => {
			const types = site?.page_types() || [];
			const typesArray = Array.isArray(types) ? types : [];

			// Filter out current page type to prevent circular dependencies
			return typesArray.filter((type) => type.id !== current_page_type?.id);
		});

		$$renderer.push(`<div class="PagesField"><div class="container svelte-4c7rsl">`);

		if (UI.Select) {
			$$renderer.push('<!--[-->');

			UI.Select($$renderer, {
				label: 'Page Type',
				value: field.config?.page_type || '',
				fullwidth: true,
				options: pageTypes().map((page_type) => ({
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