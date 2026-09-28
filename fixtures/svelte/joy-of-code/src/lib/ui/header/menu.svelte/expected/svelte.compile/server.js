import * as $ from 'svelte/internal/server';
import { fade } from 'svelte/transition';
import { createDropdownMenu, melt } from '@melt-ui/svelte';
import { Menu } from '$lib/icons';
import { sfx } from '$lib/sfx';
import * as config from '$lib/site/config';

export default function Menu_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { elements: { trigger, menu, item, arrow }, states: { open } } = createDropdownMenu({ arrowSize: 16 });

		$$renderer.push(`<button aria-label="Categories">`);
		Menu($$renderer, { width: 24, height: 24, 'aria-hidden': true });
		$$renderer.push(`<!----></button> `);

		if (open) {
			$$renderer.push(`<!--[0--><div class="menu svelte-1lw21xf"><div></div> <span class="title svelte-1lw21xf">Categories</span> <ul class="svelte-1lw21xf"><!--[-->`);

			const each_array = $.ensure_array_like(Object.entries(config.categories));

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let [slug, category] = each_array[$$index];

				$$renderer.push(`<li><a${$.attr('href', `/categories/${$.stringify(slug)}`)} class="svelte-1lw21xf">${$.escape(category)}</a></li>`);
			}

			$$renderer.push(`<!--]--></ul></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}