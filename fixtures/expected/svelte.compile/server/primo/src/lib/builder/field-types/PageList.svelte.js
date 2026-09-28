import * as $ from 'svelte/internal/server';
import { PageTypes } from '$lib/pocketbase/collections';
import Icon from '@iconify/svelte';

export default function PageList($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { field, value } = $$props;
		const selected_page_type = $.derived(() => PageTypes.one(field.config.page_type));

		$$renderer.push(`<div class="page-list svelte-1wy94tl">`);

		if (selected_page_type()) {
			$$renderer.push(`<!--[0--><span class="icon svelte-1wy94tl"${$.attr_style('', { background: selected_page_type().color })}>`);
			Icon($$renderer, { icon: selected_page_type().icon });
			$$renderer.push(`<!----></span> <span class="label svelte-1wy94tl">Page List</span>`);
		} else {
			$$renderer.push(`<!--[-1--><div>No page connected</div>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}