import * as $ from 'svelte/internal/server';
import { fade } from 'svelte/transition';
import UI from '../../../ui';
import Icon from '@iconify/svelte';
import { validate_url } from '../../../utilities';
import { Page } from '$lib/common/models/Page';
import { page } from '$app/state';
import { Sites, PageTypes, Pages } from '$lib/pocketbase/collections';
import { site_context } from '$lib/builder/stores/context';

export default function PageForm($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { parent, oncreate } = $$props;
		const { value: site } = site_context.get();
		const page_types = $.derived(() => site?.page_types());

		// set page type equal to the last type used under this parent
		const default_page_type_id = $.derived(() => parent?.children()?.[0]?.page_type ?? site?.page_types()?.[0]?.id ?? '');

		let new_page = { name: '', slug: '', page_type: '' };
		let page_creation_disabled = $.derived(() => !new_page.name || !new_page.slug);
		let page_label_edited = false;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<form${$.attr_class('svelte-ekl2j1', void 0, { 'has-page-types': page_types() && page_types().length > 1 })}>`);

			if (UI.TextInput) {
				$$renderer.push('<!--[-->');

				UI.TextInput($$renderer, {
					autofocus: true,
					id: 'page-label',
					label: 'Page Name',
					placeholder: 'About Us',
					get value() {
						return new_page.name;
					},

					set value($$value) {
						new_page.name = $$value;
						$$settled = false;
					}
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (UI.TextInput) {
				$$renderer.push('<!--[-->');

				UI.TextInput($$renderer, {
					id: 'page-slug',
					label: 'Page Slug',
					oninput: () => page_label_edited = true,
					placeholder: 'about-us',
					get value() {
						return new_page.slug;
					},

					set value($$value) {
						new_page.slug = $$value;
						$$settled = false;
					}
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (page_types() && page_types().length > 1) {
				$$renderer.push('<!--[0-->');

				if (UI.Select) {
					$$renderer.push('<!--[-->');

					UI.Select($$renderer, {
						fullwidth: true,
						label: 'Page Type',
						value: new_page.page_type,
						options: page_types()?.map((p) => ({ value: p.id, icon: p.icon, label: p.name }))
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <button${$.attr('disabled', page_creation_disabled(), true)} class="svelte-ekl2j1">`);
			Icon($$renderer, { icon: 'akar-icons:check' });
			$$renderer.push(`<!----></button></form>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}