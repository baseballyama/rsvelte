import * as $ from 'svelte/internal/server';
import * as Dialog from '$lib/components/ui/dialog';
import Item from './Item.svelte';
import Button from '$lib/builder/ui/Button.svelte';
import PageForm from './PageTypeForm.svelte';
import { PageTypes } from '$lib/pocketbase/collections';
import { site_context } from '$lib/builder/stores/context';
import { page as pageState } from '$app/state';
import { self } from '$lib/pocketbase/managers';

export default function PageTypeModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Get site from context (preferred) or fallback to hostname lookup
		const { value: site } = site_context.get();

		async function create_page_type(new_page_type) {
			if (!site) return;

			// Add the site ID to the page type
			const page_type_data = { ...new_page_type, site: site.id };

			PageTypes.create(page_type_data);
			self.commit();
		}

		let creating_page_type = false;

		if (Dialog.Header) {
			$$renderer.push('<!--[-->');
			Dialog.Header($$renderer, { title: 'Page Types', icon: 'lucide:layout-template' });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` <main class="grid gap-2 p-2 bg-[var(--primo-color-black)]"><ul class="grid gap-2"><!--[-->`);

		const each_array = $.ensure_array_like(site?.page_types() || []);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let page_type = each_array[$$index];

			$$renderer.push(`<li>`);

			Item($$renderer, {
				page_type,
				active: pageState.params.page_type === page_type.id
			});

			$$renderer.push(`<!----></li>`);
		}

		$$renderer.push(`<!--]--> `);

		if (creating_page_type) {
			$$renderer.push(`<!--[0--><li style="background: #1a1a1a;">`);
			PageForm($$renderer, {});
			$$renderer.push(`<!----></li>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></ul> `);

		Button($$renderer, {
			variants: 'secondary fullwidth',
			disabled: creating_page_type === true,
			onclick: () => creating_page_type = true,
			label: 'Create Page Type',
			icon: 'akar-icons:plus'
		});

		$$renderer.push(`<!----></main>`);
	});
}