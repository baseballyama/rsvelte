import * as $ from 'svelte/internal/server';
import * as _ from 'lodash-es';
import { tick } from 'svelte';
import { flip } from 'svelte/animate';
import UI from '$lib/builder/ui';
import * as Dialog from '$lib/components/ui/dialog';
import SectionEditor from '$lib/builder/views/modal/SectionEditor/SectionEditor.svelte';
import ComponentNode from './Layout/ComponentNode.svelte';
import BlockToolbar from './Layout/BlockToolbar.svelte';
import DropIndicator from './Layout/DropIndicator.svelte';
import { locale, dragging_symbol } from '$lib/builder/stores/app/misc';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { attachClosestEdge, extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { beforeNavigate } from '$app/navigation';

import {
	Pages,
	Sites,
	SiteSymbols,
	PageSections,
	PageTypes,
	PageSectionEntries
} from '$lib/pocketbase/collections';

import { page_context } from '$lib/builder/stores/context';
import { onModKey } from '$lib/builder/utils/keyboard';
import { watch } from 'runed';
import { setUserActivity } from '$lib/UserActivity.svelte';
import { self } from '$lib/pocketbase/managers';
import { author_mode } from '$lib/pocketbase/author_mode';
import { get } from 'svelte/store';
import { useCopyEntries } from '$lib/workers/CopyEntries.svelte';

export default function Page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { page } = $$props;

		setUserActivity({ page: page.id });

		// Set context so child components can access the page
		const context = { value: page };

		page_context.set(context);

		const site = $.derived(() => Sites.one(page.site));
		const page_type = $.derived(() => page.page_type ? PageTypes.one(page.page_type) : null);
		const page_type_sections = $.derived(() => page_type()?.sections() ?? []);

		// Group page type sections by zone
		const header_sections = $.derived(() => page_type_sections().filter((s) => s.zone === 'header'));

		const footer_sections = $.derived(() => page_type_sections().filter((s) => s.zone === 'footer'));
		const page_type_body_sections = $.derived(() => page_type_sections().filter((s) => s.zone === 'body'));
		const sections = $.derived(() => page.sections());

		// Check if page type is static (no symbols toggled - sections can't be added/removed/reordered)
		const is_static_page_type = $.derived(() => page_type() ? page_type().symbols()?.length === 0 : false);

		// Fade in page when all components mounted
		let page_mounted = false;

		// detect when all sections are mounted to fade in page
		let sections_mounted = 0;

		beforeNavigate((nav) => {
			// Navigating to the page we're already on doesn't remount sections,
			// so the mount counter would never recover — leaving the spinner stuck
			if (nav.to?.url.href === nav.from?.url.href) return;

			page_mounted = false;
			sections_mounted = 0;
		});

		async function repair_section_indices() {
			// Just use the current order of sections and assign consecutive indices
			for (let i = 0; i < sections().length; i++) {
				if (sections()[i].index !== i) {
					PageSections.update(sections()[i].id, { index: i });
				}
			}
		}

		let symbol_to_add = void 0;
		const copy_symbol_entries = $.derived(() => useCopyEntries([symbol_to_add]));

		async function add_section_to_page({ symbol, position }) {
			if (get(author_mode) === 'files') return;

			symbol_to_add = symbol;
			await tick();

			// Check if indices need repair
			const has_incorrect_indices = sections().some((section, i) => section.index !== i);

			if (has_incorrect_indices) {
				await repair_section_indices();
			}

			// Adjust indices of existing sections that come after the insertion position
			const existing_sections = sections().filter((section) => section.index >= position);

			// Create new section with correct index
			const new_section = PageSections.create({ page: page.id, symbol: symbol.id, index: position });

			await copy_symbol_entries().run(symbol_to_add, new_section);

			for (const section of existing_sections) {
				PageSections.update(section.id, { index: section.index + 1 });
			}

			await self.commit();

			return new_section.id;
		}

		async function remove_section_from_page(section_id) {
			if (get(author_mode) === 'files') return;

			const section_to_delete = sections().find((s) => s.id === section_id);

			if (!section_to_delete) return;

			// Adjust indices of remaining sections that come after the deleted section
			const sections_to_update = sections().filter((section) => section.index > section_to_delete.index);

			for (const section of sections_to_update) {
				PageSections.update(section.id, { index: section.index - 1 });
			}

			// Delete the section
			PageSections.delete(section_id);

			await self.commit();
		}

		let page_el = void 0;
		let hovered_block_el = void 0;

		////////////////////////////
		// BLOCK TOOLBAR ///////////
		////////////////////////////
		let block_toolbar_element = void 0;

		let showing_block_toolbar = false;

		// Add state variables to track hover states
		let hovering_toolbar = false;

		let hovering_section = false;

		async function show_block_toolbar() {
			// Clear any pending hide timeout
			if (hide_toolbar_timeout) {
				clearTimeout(hide_toolbar_timeout);
				hide_toolbar_timeout = null;
			}

			if (!showing_block_toolbar) {
				showing_block_toolbar = true;
				await tick();
				position_block_toolbar();
				page_el.addEventListener('scroll', position_block_toolbar);
			} else {
				// Already showing, just reposition
				position_block_toolbar();
			}
		}

		async function position_block_toolbar() {
			if (!hovered_block_el || !block_toolbar_element) return;

			const { top, left, bottom, right } = hovered_block_el.getBoundingClientRect();
			const toolbar_height = 44;

			// Keep toolbar within viewport bounds
			const toolbar_top = Math.max(toolbar_height, Math.min(top, window.innerHeight - toolbar_height));

			const toolbar_bottom = Math.max(0, window.innerHeight - bottom);

			block_toolbar_element.style.position = 'fixed';
			block_toolbar_element.style.top = `${toolbar_top}px`;
			block_toolbar_element.style.bottom = `${toolbar_bottom}px`;
			block_toolbar_element.style.left = `${left}px`;
			block_toolbar_element.style.right = `${window.innerWidth - right}px`;
		}

		let hide_toolbar_timeout = null;

		async function hide_block_toolbar() {
			// Clear any existing timeout
			if (hide_toolbar_timeout) {
				clearTimeout(hide_toolbar_timeout);
			}

			// Only hide if we're not hovering over either the toolbar or the section
			if (!hovering_toolbar && !hovering_section) {
				showing_block_toolbar = false;
				page_el.removeEventListener('scroll', position_block_toolbar);
			}
		}

		////////////////////////////
		// DROP INDICATOR //////////
		////////////////////////////
		let drop_indicator_element = void 0;

		let showing_drop_indicator = false;

		async function show_drop_indicator() {
			if (!showing_drop_indicator) {
				showing_drop_indicator = true;
				await tick();

				// Reset display style when showing
				if (drop_indicator_element) {
					drop_indicator_element.style.display = '';
				}

				page_el.addEventListener('scroll', position_drop_indicator);
			}
		}

		async function position_drop_indicator() {
			if (!hovered_block_el || !drop_indicator_element) return;

			const { top, left, bottom, right } = hovered_block_el.getBoundingClientRect();

			// Position the line at the appropriate edge
			drop_indicator_element.style.left = `${left}px`;

			drop_indicator_element.style.width = `${right - left}px`;

			if (dragging.position === 'top') {
				// Show line at the top edge of the section
				drop_indicator_element.style.top = `${top - 2}px`;

				drop_indicator_element.style.bottom = 'initial';
			} else if (dragging.position === 'bottom') {
				// Show line at the bottom edge of the section
				drop_indicator_element.style.top = `${bottom - 2}px`;

				drop_indicator_element.style.bottom = 'initial';
			}
		}

		function hide_drop_indicator() {
			showing_drop_indicator = false;

			if (page_el) {
				page_el.removeEventListener('scroll', position_drop_indicator);
			}

			// Force hide the element immediately
			if (drop_indicator_element) {
				drop_indicator_element.style.display = 'none';
			}
		}

		////////////////////////////
		let editing_section_tab = 'code';

		async function edit_section(tab) {
			if (!hovered_section()) return;

			editing_section = true;
			editing_section_tab = tab;
		}

		// Listen for Command-E hotkey to open section editor when hovered
		onModKey('e', () => {
			if (hovered_section() && showing_block_toolbar) {
				editing_section = true;
				editing_section_tab = 'code';
			}
		});

		let moving = false; // workaround to prevent block toolbar from showing when moving blocks

		// Handle unsaved changes for section editor
		let section_has_unsaved_changes = false;

		let dragging = { id: null, position: null };

		function reset_drag() {
			// Clear any pending drag leave timeout
			if (drag_leave_timeout) {
				clearTimeout(drag_leave_timeout);
				drag_leave_timeout = null;
			}

			dragging = { id: null, position: null };
			dragging_over_section = false;
			hide_drop_indicator();
		}

		let dragging_over_section = false;
		let drag_leave_timeout = null;

		function drag_fallback(element) {
			dropTargetForElements({
				element,
				getData({ input, element }) {
					return attachClosestEdge({}, { element, input, allowedEdges: ['top', 'bottom'] });
				},

				async onDrag({ self, source }) {
					// Clear any pending drag leave timeout since we're still dragging
					if (drag_leave_timeout) {
						clearTimeout(drag_leave_timeout);
						drag_leave_timeout = null;
					}

					if (dragging_over_section) return; // prevent double-adding block

					// When page is empty, use the empty state div as the drop target
					const section_count = sections().length;

					if (section_count === 0) {
						const empty_state_el = page_el.querySelector('.empty-state');

						if (empty_state_el) {
							hovered_block_el = empty_state_el;
						} else {
							hovered_block_el = page_el;
						}

						if (!showing_drop_indicator) {
							await show_drop_indicator();
						}

						position_drop_indicator();
						dragging = { id: 'empty-page', position: 'bottom' };

						return;
					}

					const last_section_id = sections()[section_count - 1]?.id ?? page_type_body_sections()[page_type_body_sections().length - 1]?.id;

					if (!last_section_id) return;

					hovered_block_el = page_el.querySelector(`[data-section="${last_section_id}"]`);

					if (!showing_drop_indicator) {
						await show_drop_indicator();
					}

					position_drop_indicator();

					if (dragging.id !== last_section_id || dragging.position !== extractClosestEdge(self.data)) {
						dragging = { id: last_section_id, position: extractClosestEdge(self.data) };
					}
				},

				onDragLeave({ source }) {
					// Use a timeout to avoid hiding the indicator when briefly leaving the area
					// but still dragging over a valid drop target
					drag_leave_timeout = setTimeout(
						() => {
							reset_drag();
						},
						100
					);
				},

				async onDrop({ source }) {
					// Immediately hide drop indicator
					hide_drop_indicator();

					// Clear any pending drag leave timeout
					if (drag_leave_timeout) {
						clearTimeout(drag_leave_timeout);
						drag_leave_timeout = null;
					}

					if (dragging_over_section) {
						return; // prevent double-adding block
					}

					const block_being_dragged = source.data.block;
					const new_section_id = await add_section_to_page({ symbol: block_being_dragged, position: sections().length });

					const new_section_el = new_section_id
						? page_el.querySelector(`[data-section="${new_section_id}"]`)
						: null;

					if (new_section_el instanceof HTMLElement) {
						new_section_el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
					}

					reset_drag();
					$.store_set(dragging_symbol, false);
				}
			});
		}

		function drag_item(element, section) {
			dropTargetForElements({
				element,
				getData({ input, element }) {
					return attachClosestEdge({ section }, { element, input, allowedEdges: ['top', 'bottom'] });
				},

				async onDrag({ self, source }) {
					// Clear any pending drag leave timeout since we're still dragging
					if (drag_leave_timeout) {
						clearTimeout(drag_leave_timeout);
						drag_leave_timeout = null;
					}

					hovered_block_el = self.element;

					if (!showing_drop_indicator) {
						await show_drop_indicator();
					}

					position_drop_indicator();

					if (dragging.id !== self.data.section.id || dragging.position !== extractClosestEdge(self.data)) {
						dragging = {
							id: self.data.section.id,
							position: extractClosestEdge(self.data)
						};
					}
				},

				onDragEnter() {
					// Clear any pending drag leave timeout since we're entering a valid drop target
					if (drag_leave_timeout) {
						clearTimeout(drag_leave_timeout);
						drag_leave_timeout = null;
					}

					dragging_over_section = true;
				},

				onDragLeave() {
					dragging_over_section = false;

					// Use a timeout to avoid hiding the indicator when briefly leaving the area
					// but still dragging over a valid drop target
					drag_leave_timeout = setTimeout(
						() => {
							reset_drag();
						},
						100
					);
				},

				async onDrop({ self, source }) {
					// Immediately hide drop indicator
					hide_drop_indicator();

					// Clear any pending drag leave timeout
					if (drag_leave_timeout) {
						clearTimeout(drag_leave_timeout);
						drag_leave_timeout = null;
					}

					const section_count = sections().length;

					const section_dragged_over_index = section_count === 0
						? page_type_body_sections().find((s) => s.id === self.data.section.id)?.index ?? 0
						: sections().find((s) => s.id === self.data.section.id)?.index ?? 0;

					const block_being_dragged = source.data.block;
					const closestEdgeOfTarget = extractClosestEdge(self.data);

					if (closestEdgeOfTarget === 'top') {
						await add_section_to_page({
							symbol: block_being_dragged,
							position: section_dragged_over_index
						});
					} else if (closestEdgeOfTarget === 'bottom') {
						await add_section_to_page({
							symbol: block_being_dragged,
							position: section_dragged_over_index + 1
						});
					}

					reset_drag();
					$.store_set(dragging_symbol, false);
				}
			});
		}

		let hovered_section_id = null;

		let hovered_section_details = {
			section: null,
			source: null,
			zone: null,
			index: 0,
			is_last: false
		};

		watch(() => hovered_section_id, (hovered_section_id) => {
			if (!hovered_section_id) return;

			const page_section = sections().find((s) => s.id === hovered_section_id);
			const page_type_section = page_type_sections().find((s) => s.id === hovered_section_id);
			const source = page_type_section ? 'page-type' : 'page';
			const zone = page_type_section ? page_type_section.zone : 'body';
			const index = (page_section || page_type_section)?.index;
			const is_last = (page_section || page_type_section).index === (page_section ? sections() : page_type_body_sections()).length - 1;

			hovered_section_details = {
				section: page_section || page_type_section,
				source,
				zone,
				index,
				is_last
			};
		});

		let hovered_section = $.derived(() => hovered_section_details?.section ?? null);
		let editing_section = false;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (hovered_section()) {
				$$renderer.push('<!--[0-->');

				if (Dialog.Root) {
					$$renderer.push('<!--[-->');

					Dialog.Root($$renderer, {
						onOpenChange: (open) => {
							if (!open) {
								// Check for unsaved changes before closing
								if (section_has_unsaved_changes) {
									if (!confirm('You have unsaved changes. Are you sure you want to close without saving?')) {
										// Prevent closing by reopening the dialog
										editing_section = true;

										return;
									}

									// User confirmed, discard changes
									self.discard();
								}
							}
						},

						get open() {
							return editing_section;
						},

						set open($$value) {
							editing_section = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (Dialog.Content) {
								$$renderer.push('<!--[-->');

								Dialog.Content($$renderer, {
									class: 'z-[999] max-w-none h-full max-h-[calc(100vh_-_1rem)] flex flex-col p-2 gap-2',
									children: ($$renderer) => {
										SectionEditor($$renderer, {
											component: hovered_section(),
											tab: editing_section_tab,
											header: {
												button: {
													label: 'Save',
													onclick: () => {
														hovering_toolbar = false;
														editing_section = false;
													}
												}
											},

											get has_unsaved_changes() {
												return section_has_unsaved_changes;
											},

											set has_unsaved_changes($$value) {
												section_has_unsaved_changes = $$value;
												$$settled = false;
											}
										});
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (!page_mounted && sections() && sections().length > 1) {
				$$renderer.push(`<!--[0--><div class="spinner svelte-we0o6z" style="--Spinner-color: var(--color-gray-7);">`);

				if (UI.Spinner) {
					$$renderer.push('<!--[-->');
					UI.Spinner($$renderer, { variant: 'loop' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(`</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (showing_drop_indicator) {
				$$renderer.push('<!--[0-->');

				DropIndicator($$renderer, {
					get node() {
						return drop_indicator_element;
					},

					set node($$value) {
						drop_indicator_element = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (sections() && page_mounted && showing_block_toolbar) {
				$$renderer.push(`<!--[0--><div class="absolute z-50">`);

				BlockToolbar($$renderer, {
					id: hovered_section_id,
					i: hovered_section_details.index,
					is_last: hovered_section_details.is_last,
					immovable: is_static_page_type() || hovered_section_details.source === 'page-type',
					layout_zone: hovered_section_details.zone !== 'body' ? hovered_section_details.zone : null,
					page_type: page_type(),
					get node() {
						return block_toolbar_element;
					},

					set node($$value) {
						block_toolbar_element = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <main id="Page"${$.attr('lang', $.store_get($$store_subs ??= {}, '$locale', locale))}${$.attr_class('svelte-we0o6z', void 0, {
				'fadein': page_mounted,
				'dragging': $.store_get($$store_subs ??= {}, '$dragging_symbol', dragging_symbol)
			})}>`);

			if (header_sections().length > 0) {
				$$renderer.push('<!--[0-->');

				const show_block_toolbar_on_hover = page_mounted && !moving;

				$$renderer.push(`<header class="page-header-zone"><!--[-->`);

				const each_array = $.ensure_array_like(header_sections());

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let page_type_section = each_array[$$index];
					const block = SiteSymbols.one(page_type_section.symbol);

					if (block) {
						$$renderer.push(`<!--[0--><div role="presentation"${$.attr('data-section', page_type_section.id)}${$.attr('data-symbol', block?.id)} class="page-type-section header-section svelte-we0o6z">`);
						ComponentNode($$renderer, { block, section: page_type_section });
						$$renderer.push(`<!----></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!--]--></header>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (sections()) {
				$$renderer.push(`<!--[0--><section class="page-content-zone flex-1 flex flex-col"><!--[-->`);

				const each_array_1 = $.ensure_array_like(sections().filter((s) => SiteSymbols.one(s.symbol)));

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let section = each_array_1[$$index_1];
					const block = SiteSymbols.one(section.symbol);
					const show_block_toolbar_on_hover = page_mounted && !moving;

					$$renderer.push(`<div role="presentation"${$.attr('data-section', section.id)}${$.attr('data-symbol', block?.id)} class="svelte-we0o6z">`);
					ComponentNode($$renderer, { block, section });
					$$renderer.push(`<!----></div>`);
				}

				$$renderer.push(`<!--]--> `);

				if (sections().length === 0) {
					$$renderer.push(`<!--[0--><div${$.attr_class('empty-state svelte-we0o6z', void 0, { 'dragging-over': hovered_block_el && dragging })} style="height: calc(100vh - 47px)"><div class="_container svelte-we0o6z"><span class="svelte-we0o6z">Drag blocks here to add them to the page</span></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></section>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (footer_sections().length > 0) {
				$$renderer.push('<!--[0-->');

				const show_block_toolbar_on_hover = page_mounted && !moving;

				$$renderer.push(`<footer class="page-footer-zone"><!--[-->`);

				const each_array_2 = $.ensure_array_like(footer_sections());

				for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
					let page_type_section = each_array_2[$$index_2];
					const block = SiteSymbols.one(page_type_section.symbol);

					if (block) {
						$$renderer.push(`<!--[0--><div role="presentation"${$.attr('data-section', page_type_section.id)}${$.attr('data-symbol', block?.id)} class="page-type-section footer-section svelte-we0o6z">`);
						ComponentNode($$renderer, { block, section: page_type_section });
						$$renderer.push(`<!----></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!--]--></footer>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (site()?.foot) {
				$$renderer.push(`<!--[0--><div class="site-foot svelte-we0o6z">${$.html(site().foot)}</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></main>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}