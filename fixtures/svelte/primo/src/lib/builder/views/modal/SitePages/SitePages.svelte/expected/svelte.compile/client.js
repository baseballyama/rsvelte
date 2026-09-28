import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<li class="svelte-nekb7z"><!> <div><div class="svelte-nekb7z"></div></div> <div class="drop-target-gap svelte-nekb7z"></div></li>`);
var root_1 = $.from_html(`<li class="building-placeholder svelte-nekb7z"><div class="building-page-item svelte-nekb7z"><!> <span class="svelte-nekb7z"> </span></div></li>`);
var root_2 = $.from_html(`<li class="svelte-nekb7z"><!></li>`);
var root_3 = $.from_html(`<li class="svelte-nekb7z"><button class="create-page-btn svelte-nekb7z"><!> <span class="svelte-nekb7z">Create Page</span></button></li>`);
var root_4 = $.from_html(`<ul class="grid p-2 bg-[var(--primo-color-black)] page-list svelte-nekb7z"><!> <!> <!></ul>`);
var root_5 = $.from_html(`<!> <!>`, 1);

export default function SitePages($$anchor, $$props) {
	$.push($$props, true);

	let hover_position = $.state(null);

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
					$.set(hover_position, null);

					return;
				}

				const edge = extractClosestEdge(self.data);

				if (edge === 'top') {
					$.set(hover_position, `${page.id}-bottom`);
				}
			},

			onDragLeave() {
				$.set(hover_position, null);
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

	const active_page = $.derived(() => $.get(current_path)
		? resolve_page(site, $.get(current_path))
		: site.homepage());

	const homepage = $.derived(() => site.homepage());
	const all_pages = $.derived(() => site.pages() ?? []);
	const root_pages = $.derived(() => $.get(homepage)?.children() || []);
	let creating_page = $.state(false);
	let building_page = $.state(false);
	let building_page_name = $.state('');
	let new_page = $.state(void 0);
	let new_page_page_type = $.derived(() => $.get(new_page) && PageTypes.one($.get(new_page).page_type));
	let new_page_page_type_sections = $.derived(() => $.get(new_page_page_type)?.sections());
	const copy_page_type_entries = $.derived(() => useCopyEntries([$.get(new_page_page_type)]));
	const copy_page_type_section_entries = $.derived(() => useCopyEntries($.get(new_page_page_type_sections)));

	// Copy page type entries
	let copying_page_type_entries = $.state('no');

	$.user_effect(() => {
		if (!$.get(new_page) || !$.get(new_page_page_type) || !$.get(copy_page_type_entries) || $.get(copying_page_type_entries) !== 'no') {
			return;
		}

		$.set(copying_page_type_entries, 'working');

		$.get(copy_page_type_entries).run($.get(new_page_page_type), $.get(new_page)).then(() => {
			$.set(copying_page_type_entries, 'done');
		}).catch((error) => console.error(error));
	});

	// Copy page type sections to new page
	let copying_page_type_section_entries = $.state('no');

	$.user_effect(() => {
		if (!$.get(new_page) || !$.get(new_page_page_type_sections) || !$.get(copy_page_type_section_entries) || $.get(copying_page_type_section_entries) !== 'no' || $.get(copying_page_type_entries) !== 'done') {
			return;
		}

		$.set(copying_page_type_section_entries, 'working');

		let promise = Promise.resolve();

		for (const pts of $.get(new_page_page_type_sections)) {
			// Skip header and footer sections - these are handled at the site level
			if (pts.zone === 'header' || pts.zone === 'footer') {
				continue;
			}

			// Create the page section
			const page_section = PageSections.create({
				page: $.get(new_page).id,
				symbol: pts.symbol,
				index: pts.index
			});

			promise = promise.then(() => $.get(copy_page_type_section_entries).run(pts, page_section));
		}

		promise.then(async () => {
			$.set(copying_page_type_section_entries, 'done');
		}).catch((error) => console.error(error));
	});

	$.user_effect(() => {
		if ($.get(building_page) && $.get(copying_page_type_entries) === 'done' && $.get(copying_page_type_section_entries) === 'done') {
			$.set(new_page, undefined);

			self.commit().catch((error) => console.error(error)).finally(() => {
				$.set(building_page, false);
				$.set(copying_page_type_entries, 'no');
				$.set(copying_page_type_section_entries, 'no');
			});
		}
	});

	async function create_page_with_sections(page_data) {
		// Get existing siblings and find the max index
		const sibling_pages = $.get(all_pages).filter((page) => page.parent === page_data.parent);

		const maxIndex = sibling_pages.length > 0 ? Math.max(...sibling_pages.map((p) => p.index)) : -1;
		const new_index = maxIndex + 1;

		// Create the page with the next available index
		$.set(new_page, Pages.create({ ...page_data, index: new_index }), true);
	}

	var fragment = root_5();
	var node_1 = $.first_child(fragment);

	$.component(node_1, () => Dialog.Header, ($$anchor, Dialog_Header) => {
		Dialog_Header($$anchor, {
			get title() {
				return `Pages (${$.get(all_pages).length ?? ''})`;
			},
			icon: 'iconoir:multiple-pages'
		});
	});

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent_2 = ($$anchor) => {
			var ul = root_4();
			var node_3 = $.child(ul);

			$.each(node_3, 27, () => [$.get(homepage), ...$.get(root_pages)].sort((a, b) => a.index - b.index), (page) => page.id, ($$anchor, page) => {
				var li = root();
				var node_4 = $.child(li);

				{
					let $0 = $.derived(() => !pageState.params.page_type ? $.get(active_page).id : null);

					Item(node_4, {
						get page() {
							return $.get(page);
						},

						get page_slug() {
							return $.get(page_slug);
						},

						get active_page_id() {
							return $.get($0);
						},
						oncreate: create_page_with_sections,
						get hover_position() {
							return $.get(hover_position);
						},

						set hover_position($$value) {
							$.set(hover_position, $$value, true);
						}
					});
				}

				var div = $.sibling(node_4, 2);
				let classes;
				var div_1 = $.sibling(div, 2);

				$.action(div_1, ($$node, $$action_arg) => gapDropTarget?.($$node, $$action_arg), () => $.get(page));
				$.reset(li);
				$.template_effect(() => classes = $.set_class(div, 1, 'drop-indicator-inline svelte-nekb7z', null, classes, { active: $.get(hover_position) === `${$.get(page).id}-bottom` }));
				$.animation(li, () => flip, () => ({ duration: 200 }));
				$.append($$anchor, li);
			});

			var node_5 = $.sibling(node_3, 2);

			{
				var consequent = ($$anchor) => {
					var li_1 = root_1();
					var div_2 = $.child(li_1);
					var node_6 = $.child(div_2);

					Icon(node_6, { icon: 'eos-icons:three-dots-loading' });

					var span = $.sibling(node_6, 2);
					var text = $.only_child(span);

					$.reset(div_2);
					$.reset(li_1);
					$.template_effect(() => $.set_text(text, `Building ${$.get(building_page_name) ?? ''} Page`));
					$.append($$anchor, li_1);
				};

				$.if(node_5, ($$render) => {
					if ($.get(building_page)) $$render(consequent);
				});
			}

			var node_7 = $.sibling(node_5, 2);

			{
				var consequent_1 = ($$anchor) => {
					var li_2 = root_2();
					var node_8 = $.child(li_2);

					PageForm(node_8, {
						oncreate: async (new_page) => {
							$.set(creating_page, false);

							const url_taken = $.get(all_pages).some((page) => page?.slug === new_page.slug && page.parent === $.get(homepage).id);

							if (url_taken) {
								alert(`That URL is already in use`);
							} else {
								$.set(building_page, true);
								$.set(building_page_name, new_page.name, true);
								await create_page_with_sections({ ...new_page, parent: $.get(homepage).id, site: site.id });
							}
						}
					});

					$.reset(li_2);
					$.append($$anchor, li_2);
				};

				var alternate = ($$anchor) => {
					var li_3 = root_3();
					var button = $.child(li_3);
					var node_9 = $.child(button);

					Icon(node_9, { icon: 'akar-icons:plus' });
					$.next(2);
					$.reset(button);
					$.reset(li_3);
					$.delegated('click', button, () => $.set(creating_page, true));
					$.append($$anchor, li_3);
				};

				$.if(node_7, ($$render) => {
					if ($.get(creating_page)) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			$.reset(ul);
			$.append($$anchor, ul);
		};

		$.if(node_2, ($$render) => {
			if ($.get(active_page)) $$render(consequent_2);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);