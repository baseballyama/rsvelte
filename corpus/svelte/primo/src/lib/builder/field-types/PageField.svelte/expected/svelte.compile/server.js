import * as $ from 'svelte/internal/server';
import UI from '../ui/index.js';
import { site_context } from '$lib/builder/stores/context';

export default function PageField($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { field, entry, onchange } = $$props;
		const { value: site } = site_context.getOr({ value: null });

		const selectable_pages = $.derived(() => {
			const pages = site?.pages() ?? [];
			const filtered = pages.filter((p) => p.page_type === field.config.page_type);

			return filtered;
		});

		$$renderer.push(`<div class="svelte-1u70j71">`);

		if (UI.Select) {
			$$renderer.push('<!--[-->');

			UI.Select($$renderer, {
				label: field.label,
				value: entry?.value || '',
				options: selectable_pages().map((page) => ({ value: page.id, label: page?.name })),
				fullwidth: true
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div>`);
	});
}