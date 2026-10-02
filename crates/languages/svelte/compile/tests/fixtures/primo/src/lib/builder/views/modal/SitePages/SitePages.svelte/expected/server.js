import * as $ from 'svelte/internal/server';
import { page as pageState } from '$app/state';
import * as Dialog from '$lib/components/ui/dialog';
import Item from './Item.svelte';
import PageForm from './PageForm.svelte';
import Icon from '@iconify/svelte';

import {
	Pages,
	PageTypes,
	PageSections,
	PageSectionEntries,
	PageEntries
} from '$lib/pocketbase/collections';

import { resolve_page } from '$lib/pages';
import { site_context } from '$lib/builder/stores/context';
import { self } from '$lib/pocketbase/managers';
import { flip } from 'svelte/animate';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { attachClosestEdge, extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { useCopyEntries } from '$lib/workers/CopyEntries.svelte';

export default function SitePages($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let hover_position = null;

		function gapDropTarget(node, page) {
			dropTargetForElements({
				element: node,
				getData({ input }) {
					return attachClosestEdge({ page }, { element: node, input, allowedEdges: ['top'] });
				},

				onDrag({ self, source }) {
					const page_being_dragged = source.data.page;
					const same_parent = page.parent === page_being_dragged.parent;

					if (!same_parent) {
						hover_position = null;

						return;
					}

					const edge = extractClosestEdge(self.data);

					if (edge === 'top') {
						hover_position = `${page.id}-bottom`;
					}
				},

				onDragLeave() {
					hover_position = null;
				}
			});

			return {
				destroy() {
					// Cleanup if needed
				}
			};
		}

		// Get site from context (preferred) or fallback to hostname lookup
		const { value: site } = site_context.get();

		const page_slug = $.derived(() => pageState.params.page);
		const current_path = $.derived(() => pageState.params.page?.split('/'));
		const active_page = $.derived(() => current_path() ? resolve_page(site, current_path()) : site.homepage());
		const homepage = $.derived(() => site.homepage());
		const all_pages = $.derived(() => site.pages() ?? []);
		const root_pages = $.derived(() => homepage()?.children() || []);
		let creating_page = false;
		let building_page = false;
		let building_page_name = '';
		let new_page = void 0;
		let new_page_page_type = $.derived(() => new_page && PageTypes.one(new_page.page_type));
		let new_page_page_type_sections = $.derived(() => new_page_page_type()?.sections());
		const copy_page_type_entries = $.derived(() => useCopyEntries([new_page_page_type()]));
		const copy_page_type_section_entries = $.derived(() => useCopyEntries(new_page_page_type_sections()));

		// Copy page type entries
		let copying_page_type_entries = 'no';

		// Copy page type sections to new page
		let copying_page_type_section_entries = 'no';

		// Skip header and footer sections - these are handled at the site level
		// Create the page section
		async function create_page_with_sections(page_data) {
			// Get existing siblings and find the max index
			const sibling_pages = all_pages().filter((page) => page.parent === page_data.parent);

			const maxIndex = sibling_pages.length > 0 ? Math.max(...sibling_pages.map((p) => p.index)) : -1;
			const new_index = maxIndex + 1;

			// Create the page with the next available index
			new_page = Pages.create({ ...page_data, index: new_index });
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Dialog.Header) {
				$$renderer.push('<!--[-->');

				Dialog.Header($$renderer, {
					title: `Pages (${$.stringify(all_pages().length)})`,
					icon: 'iconoir:multiple-pages'
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (active_page()) {
				$$renderer.push(`<!--[0--><ul class="grid p-2 bg-[var(--primo-color-black)] page-list svelte-nekb7z"><!--[-->`);

				const each_array = $.ensure_array_like([homepage(), ...root_pages()].sort((a, b) => a.index - b.index));

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let page = each_array[i];

					$$renderer.push(`<li class="svelte-nekb7z">`);

					Item($$renderer, {
						page,
						page_slug: page_slug(),
						active_page_id: !pageState.params.page_type ? active_page().id : null,
						oncreate: create_page_with_sections,
						get hover_position() {
							return hover_position;
						},

						set hover_position($$value) {
							hover_position = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> <div${$.attr_class('drop-indicator-inline svelte-nekb7z', void 0, { 'active': hover_position === `${page.id}-bottom` })}><div class="svelte-nekb7z"></div></div> <div class="drop-target-gap svelte-nekb7z"></div></li>`);
				}

				$$renderer.push(`<!--]--> `);

				if (building_page) {
					$$renderer.push(`<!--[0--><li class="building-placeholder svelte-nekb7z"><div class="building-page-item svelte-nekb7z">`);
					Icon($$renderer, { icon: 'eos-icons:three-dots-loading' });
					$$renderer.push(`<!----> <span class="svelte-nekb7z">Building ${$.escape(building_page_name)} Page</span></div></li>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (creating_page) {
					$$renderer.push(`<!--[0--><li class="svelte-nekb7z">`);

					PageForm($$renderer, {
						oncreate: async (new_page) => {
							creating_page = false;

							const url_taken = all_pages().some((page) => page?.slug === new_page.slug && page.parent === homepage().id);

							if (url_taken) {
								alert(`That URL is already in use`);
							} else {
								building_page = true;
								building_page_name = new_page.name;
								await create_page_with_sections({ ...new_page, parent: homepage().id, site: site.id });
							}
						}
					});

					$$renderer.push(`<!----></li>`);
				} else {
					$$renderer.push(`<!--[-1--><li class="svelte-nekb7z"><button class="create-page-btn svelte-nekb7z">`);
					Icon($$renderer, { icon: 'akar-icons:plus' });
					$$renderer.push(`<!----> <span class="svelte-nekb7z">Create Page</span></button></li>`);
				}

				$$renderer.push(`<!--]--></ul>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}