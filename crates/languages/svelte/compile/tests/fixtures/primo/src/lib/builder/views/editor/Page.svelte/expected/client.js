import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="spinner svelte-we0o6z" style="--Spinner-color: var(--color-gray-7);"><!></div>`);
var root_1 = $.from_html(`<div class="absolute z-50"><!></div>`);
var root_2 = $.from_html(`<div role="presentation" class="page-type-section header-section svelte-we0o6z"><!></div>`);
var root_3 = $.from_html(`<header class="page-header-zone"></header>`);
var root_4 = $.from_html(`<div role="presentation" class="svelte-we0o6z"><!></div>`);
var root_5 = $.from_html(`<div style="height: calc(100vh - 47px)"><div class="_container svelte-we0o6z"><span class="svelte-we0o6z">Drag blocks here to add them to the page</span></div></div>`);
var root_6 = $.from_html(`<section class="page-content-zone flex-1 flex flex-col"><!> <!></section>`);
var root_7 = $.from_html(`<div role="presentation" class="page-type-section footer-section svelte-we0o6z"><!></div>`);
var root_8 = $.from_html(`<footer class="page-footer-zone"></footer>`);
var root_9 = $.from_html(`<div class="site-foot svelte-we0o6z"></div>`);
var root_10 = $.from_html(`<!> <!> <!> <!> <main id="Page"><!> <!> <!> <!></main>`, 1);

export default function Page($$anchor, $$props) {
	$.push($$props, true);

	const $dragging_symbol = () => $.store_get(dragging_symbol, '$dragging_symbol', $$stores);
	const $author_mode = () => $.store_get(author_mode, '$author_mode', $$stores);
	const $locale = () => $.store_get(locale, '$locale', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	setUserActivity({ page: $$props.page.id });

	// Set context so child components can access the page
	const context = $.proxy({ value: $$props.page });

	page_context.set(context);

	$.user_effect(() => {
		context.value = $$props.page;
	});

	const site = $.derived(() => Sites.one($$props.page.site));
	const page_type = $.derived(() => $$props.page.page_type ? PageTypes.one($$props.page.page_type) : null);
	const page_type_sections = $.derived(() => $.get(page_type)?.sections() ?? []);

	// Group page type sections by zone
	const header_sections = $.derived(() => $.get(page_type_sections).filter((s) => s.zone === 'header'));

	const footer_sections = $.derived(() => $.get(page_type_sections).filter((s) => s.zone === 'footer'));
	const page_type_body_sections = $.derived(() => $.get(page_type_sections).filter((s) => s.zone === 'body'));
	const sections = $.derived(() => $$props.page.sections());

	// Check if page type is static (no symbols toggled - sections can't be added/removed/reordered)
	const is_static_page_type = $.derived(() => $.get(page_type) ? $.get(page_type).symbols()?.length === 0 : false);

	// Fade in page when all components mounted
	let page_mounted = $.state(false);

	// detect when all sections are mounted to fade in page
	let sections_mounted = $.state(0);

	beforeNavigate((nav) => {
		// Navigating to the page we're already on doesn't remount sections,
		// so the mount counter would never recover — leaving the spinner stuck
		if (nav.to?.url.href === nav.from?.url.href) return;

		$.set(page_mounted, false);
		$.set(sections_mounted, 0);
	});

	async function repair_section_indices() {
		// Just use the current order of sections and assign consecutive indices
		for (let i = 0; i < $.get(sections).length; i++) {
			if ($.get(sections)[i].index !== i) {
				PageSections.update($.get(sections)[i].id, { index: i });
			}
		}
	}

	let symbol_to_add = $.state(void 0);
	const copy_symbol_entries = $.derived(() => useCopyEntries([$.get(symbol_to_add)]));

	async function add_section_to_page({ symbol, position }) {
		if (get(author_mode) === 'files') return;

		$.set(symbol_to_add, symbol, true);
		await tick();

		// Check if indices need repair
		const has_incorrect_indices = $.get(sections).some((section, i) => section.index !== i);

		if (has_incorrect_indices) {
			await repair_section_indices();
		}

		// Adjust indices of existing sections that come after the insertion position
		const existing_sections = $.get(sections).filter((section) => section.index >= position);

		// Create new section with correct index
		const new_section = PageSections.create({ page: $$props.page.id, symbol: symbol.id, index: position });

		await $.get(copy_symbol_entries).run($.get(symbol_to_add), new_section);

		for (const section of existing_sections) {
			PageSections.update(section.id, { index: section.index + 1 });
		}

		await self.commit();

		return new_section.id;
	}

	async function remove_section_from_page(section_id) {
		if (get(author_mode) === 'files') return;

		const section_to_delete = $.get(sections).find((s) => s.id === section_id);

		if (!section_to_delete) return;

		// Adjust indices of remaining sections that come after the deleted section
		const sections_to_update = $.get(sections).filter((section) => section.index > section_to_delete.index);

		for (const section of sections_to_update) {
			PageSections.update(section.id, { index: section.index - 1 });
		}

		// Delete the section
		PageSections.delete(section_id);

		await self.commit();
	}

	let page_el = $.state(void 0);
	let hovered_block_el = $.state(void 0);

	////////////////////////////
	// BLOCK TOOLBAR ///////////
	////////////////////////////
	let block_toolbar_element = $.state(void 0);

	let showing_block_toolbar = $.state(false);

	// Add state variables to track hover states
	let hovering_toolbar = $.state(false);

	let hovering_section = $.state(false);

	async function show_block_toolbar() {
		// Clear any pending hide timeout
		if (hide_toolbar_timeout) {
			clearTimeout(hide_toolbar_timeout);
			hide_toolbar_timeout = null;
		}

		if (!$.get(showing_block_toolbar)) {
			$.set(showing_block_toolbar, true);
			await tick();
			position_block_toolbar();
			$.get(page_el).addEventListener('scroll', position_block_toolbar);
		} else {
			// Already showing, just reposition
			position_block_toolbar();
		}
	}

	async function position_block_toolbar() {
		if (!$.get(hovered_block_el) || !$.get(block_toolbar_element)) return;

		const { top, left, bottom, right } = $.get(hovered_block_el).getBoundingClientRect();
		const toolbar_height = 44;

		// Keep toolbar within viewport bounds
		const toolbar_top = Math.max(toolbar_height, Math.min(top, window.innerHeight - toolbar_height));

		const toolbar_bottom = Math.max(0, window.innerHeight - bottom);

		$.get(block_toolbar_element).style.position = 'fixed';
		$.get(block_toolbar_element).style.top = `${toolbar_top}px`;
		$.get(block_toolbar_element).style.bottom = `${toolbar_bottom}px`;
		$.get(block_toolbar_element).style.left = `${left}px`;
		$.get(block_toolbar_element).style.right = `${window.innerWidth - right}px`;
	}

	let hide_toolbar_timeout = null;

	async function hide_block_toolbar() {
		// Clear any existing timeout
		if (hide_toolbar_timeout) {
			clearTimeout(hide_toolbar_timeout);
		}

		// Only hide if we're not hovering over either the toolbar or the section
		if (!$.get(hovering_toolbar) && !$.get(hovering_section)) {
			$.set(showing_block_toolbar, false);
			$.get(page_el).removeEventListener('scroll', position_block_toolbar);
		}
	}

	////////////////////////////
	// DROP INDICATOR //////////
	////////////////////////////
	let drop_indicator_element = $.state(void 0);

	let showing_drop_indicator = $.state(false);

	async function show_drop_indicator() {
		if (!$.get(showing_drop_indicator)) {
			$.set(showing_drop_indicator, true);
			await tick();

			// Reset display style when showing
			if ($.get(drop_indicator_element)) {
				$.get(drop_indicator_element).style.display = '';
			}

			$.get(page_el).addEventListener('scroll', position_drop_indicator);
		}
	}

	async function position_drop_indicator() {
		if (!$.get(hovered_block_el) || !$.get(drop_indicator_element)) return;

		const { top, left, bottom, right } = $.get(hovered_block_el).getBoundingClientRect();

		// Position the line at the appropriate edge
		$.get(drop_indicator_element).style.left = `${left}px`;

		$.get(drop_indicator_element).style.width = `${right - left}px`;

		if ($.get(dragging).position === 'top') {
			// Show line at the top edge of the section
			$.get(drop_indicator_element).style.top = `${top - 2}px`;

			$.get(drop_indicator_element).style.bottom = 'initial';
		} else if ($.get(dragging).position === 'bottom') {
			// Show line at the bottom edge of the section
			$.get(drop_indicator_element).style.top = `${bottom - 2}px`;

			$.get(drop_indicator_element).style.bottom = 'initial';
		}
	}

	function hide_drop_indicator() {
		$.set(showing_drop_indicator, false);

		if ($.get(page_el)) {
			$.get(page_el).removeEventListener('scroll', position_drop_indicator);
		}

		// Force hide the element immediately
		if ($.get(drop_indicator_element)) {
			$.get(drop_indicator_element).style.display = 'none';
		}
	}

	////////////////////////////
	let editing_section_tab = $.state('code');

	async function edit_section(tab) {
		if (!$.get(hovered_section)) return;

		$.set(editing_section, true);
		$.set(editing_section_tab, tab, true);
	}

	// Listen for Command-E hotkey to open section editor when hovered
	onModKey('e', () => {
		if ($.get(hovered_section) && $.get(showing_block_toolbar)) {
			$.set(editing_section, true);
			$.set(editing_section_tab, 'code');
		}
	});

	let moving = $.state(false // workaround to prevent block toolbar from showing when moving blocks
	);

	// Handle unsaved changes for section editor
	let section_has_unsaved_changes = $.state(false);

	let dragging = $.state($.proxy({ id: null, position: null }));

	function reset_drag() {
		// Clear any pending drag leave timeout
		if (drag_leave_timeout) {
			clearTimeout(drag_leave_timeout);
			drag_leave_timeout = null;
		}

		$.set(dragging, { id: null, position: null }, true);
		$.set(dragging_over_section, false);
		hide_drop_indicator();
	}

	let dragging_over_section = $.state(false);
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

				if ($.get(dragging_over_section // prevent double-adding block
				)) return;

				// When page is empty, use the empty state div as the drop target
				const section_count = $.get(sections).length;

				if (section_count === 0) {
					const empty_state_el = $.get(page_el).querySelector('.empty-state');

					if (empty_state_el) {
						$.set(hovered_block_el, empty_state_el, true);
					} else {
						$.set(hovered_block_el, $.get(page_el), true);
					}

					if (!$.get(showing_drop_indicator)) {
						await show_drop_indicator();
					}

					position_drop_indicator();
					$.set(dragging, { id: 'empty-page', position: 'bottom' }, true);

					return;
				}

				const last_section_id = $.get(sections)[section_count - 1]?.id ?? $.get(page_type_body_sections)[$.get(page_type_body_sections).length - 1]?.id;

				if (!last_section_id) return;

				$.set(hovered_block_el, $.get(page_el).querySelector(`[data-section="${last_section_id}"]`), true);

				if (!$.get(showing_drop_indicator)) {
					await show_drop_indicator();
				}

				position_drop_indicator();

				if ($.get(dragging).id !== last_section_id || $.get(dragging).position !== extractClosestEdge(self.data)) {
					$.set(dragging, { id: last_section_id, position: extractClosestEdge(self.data) }, true);
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

				if ($.get(dragging_over_section)) {
					return; // prevent double-adding block
				}

				const block_being_dragged = source.data.block;

				const new_section_id = await add_section_to_page({
					symbol: block_being_dragged,
					position: $.get(sections).length
				});

				const new_section_el = new_section_id
					? $.get(page_el).querySelector(`[data-section="${new_section_id}"]`)
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

				$.set(hovered_block_el, self.element, true);

				if (!$.get(showing_drop_indicator)) {
					await show_drop_indicator();
				}

				position_drop_indicator();

				if ($.get(dragging).id !== self.data.section.id || $.get(dragging).position !== extractClosestEdge(self.data)) {
					$.set(
						dragging,
						{
							id: self.data.section.id,
							position: extractClosestEdge(self.data)
						},
						true
					);
				}
			},

			onDragEnter() {
				// Clear any pending drag leave timeout since we're entering a valid drop target
				if (drag_leave_timeout) {
					clearTimeout(drag_leave_timeout);
					drag_leave_timeout = null;
				}

				$.set(dragging_over_section, true);
			},

			onDragLeave() {
				$.set(dragging_over_section, false);

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

				const section_count = $.get(sections).length;

				const section_dragged_over_index = section_count === 0
					? $.get(page_type_body_sections).find((s) => s.id === self.data.section.id)?.index ?? 0
					: $.get(sections).find((s) => s.id === self.data.section.id)?.index ?? 0;

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

	$.user_effect(() => {
		if (!$.get(sections)) {
			$.set(sections_mounted, 0);
			$.set(page_mounted, false);

			return;
		}

		const target_count = $.get(sections).length;

		if (target_count === 0) {
			$.set(sections_mounted, 0);
			$.set(page_mounted, true);

			return;
		}

		$.set(sections_mounted, Math.min($.get(sections_mounted), target_count), true);

		if ($.get(sections_mounted) >= target_count) {
			$.set(page_mounted, true);
		} else if (!$.get(page_mounted)) {
			$.set(page_mounted, false);
		}
	});

	let hovered_section_id = $.state(null);

	let hovered_section_details = $.state($.proxy({
		section: null,
		source: null,
		zone: null,
		index: 0,
		is_last: false
	}));

	watch(() => $.get(hovered_section_id), (hovered_section_id) => {
		if (!hovered_section_id) return;

		const page_section = $.get(sections).find((s) => s.id === hovered_section_id);
		const page_type_section = $.get(page_type_sections).find((s) => s.id === hovered_section_id);
		const source = page_type_section ? 'page-type' : 'page';
		const zone = page_type_section ? page_type_section.zone : 'body';
		const index = (page_section || page_type_section)?.index;
		const is_last = (page_section || page_type_section).index === (page_section ? $.get(sections) : $.get(page_type_body_sections)).length - 1;

		$.set(
			hovered_section_details,
			{
				section: page_section || page_type_section,
				source,
				zone,
				index,
				is_last
			},
			true
		);
	});

	let hovered_section = $.derived(() => $.get(hovered_section_details)?.section ?? null);
	let editing_section = $.state(false);
	var fragment = root_10();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => Dialog.Root, ($$anchor, Dialog_Root) => {
				Dialog_Root($$anchor, {
					onOpenChange: (open) => {
						if (!open) {
							// Check for unsaved changes before closing
							if ($.get(section_has_unsaved_changes)) {
								if (!confirm('You have unsaved changes. Are you sure you want to close without saving?')) {
									// Prevent closing by reopening the dialog
									$.set(editing_section, true);

									return;
								}

								// User confirmed, discard changes
								self.discard();
							}
						}
					},

					get open() {
						return $.get(editing_section);
					},

					set open($$value) {
						$.set(editing_section, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => Dialog.Content, ($$anchor, Dialog_Content) => {
							Dialog_Content($$anchor, {
								class: 'z-[999] max-w-none h-full max-h-[calc(100vh_-_1rem)] flex flex-col p-2 gap-2',
								children: ($$anchor, $$slotProps) => {
									SectionEditor($$anchor, {
										get component() {
											return $.get(hovered_section);
										},

										get tab() {
											return $.get(editing_section_tab);
										},

										header: {
											button: {
												label: 'Save',
												onclick: () => {
													$.set(hovering_toolbar, false);
													$.set(editing_section, false);
												}
											}
										},

										get has_unsaved_changes() {
											return $.get(section_has_unsaved_changes);
										},

										set has_unsaved_changes($$value) {
											$.set(section_has_unsaved_changes, $$value, true);
										}
									});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(hovered_section)) $$render(consequent);
		});
	}

	var node_3 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div = root();
			var node_4 = $.child(div);

			$.component(node_4, () => UI.Spinner, ($$anchor, UI_Spinner) => {
				UI_Spinner($$anchor, { variant: 'loop' });
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node_3, ($$render) => {
			if (!$.get(page_mounted) && $.get(sections) && $.get(sections).length > 1) $$render(consequent_1);
		});
	}

	var node_5 = $.sibling(node_3, 2);

	{
		var consequent_2 = ($$anchor) => {
			DropIndicator($$anchor, {
				get node() {
					return $.get(drop_indicator_element);
				},

				set node($$value) {
					$.set(drop_indicator_element, $$value, true);
				}
			});
		};

		$.if(node_5, ($$render) => {
			if ($.get(showing_drop_indicator)) $$render(consequent_2);
		});
	}

	var node_6 = $.sibling(node_5, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_1 = root_1();
			var node_7 = $.child(div_1);

			{
				let $0 = $.derived(() => $.get(is_static_page_type) || $.get(hovered_section_details).source === 'page-type');
				let $1 = $.derived(() => $.get(hovered_section_details).zone !== 'body' ? $.get(hovered_section_details).zone : null);

				BlockToolbar(node_7, {
					get id() {
						return $.get(hovered_section_id);
					},

					get i() {
						return $.get(hovered_section_details).index;
					},

					get is_last() {
						return $.get(hovered_section_details).is_last;
					},

					get immovable() {
						return $.get($0);
					},

					get layout_zone() {
						return $.get($1);
					},

					get page_type() {
						return $.get(page_type);
					},

					get node() {
						return $.get(block_toolbar_element);
					},

					set node($$value) {
						$.set(block_toolbar_element, $$value, true);
					},

					$$events: {
						delete: async () => {
							// Get the section ID before clearing state
							const section_id_to_delete = $.get(hovered_section_id);

							// Force hide the toolbar immediately
							$.set(showing_block_toolbar, false);

							$.set(hovered_section_id, null);
							$.set(hovered_block_el, null);
							$.get(page_el).removeEventListener('scroll', position_block_toolbar);
							await remove_section_from_page(section_id_to_delete);
						},
						'edit-code': () => edit_section('code'),
						'edit-content': () => edit_section('content'),
						moveUp: async () => {
							if ($author_mode() === 'files') return;
							if (!$.get(hovered_section)) return;

							let section_to_move = $.get(hovered_section);

							if (!section_to_move || section_to_move.index === 0) return;

							const section_above = $.get(sections).find((s) => s.index === section_to_move.index - 1);

							if (!section_above) return;

							$.set(moving, true);
							hide_block_toolbar();
							PageSections.update(section_to_move.id, { index: section_to_move.index - 1 });
							PageSections.update(section_above.id, { index: section_to_move.index });
							await self.commit();

							setTimeout(
								() => {
									$.set(moving, false);
								},
								300
							);
						},

						moveDown: async () => {
							if ($author_mode() === 'files') return;
							if (!$.get(hovered_section)) return;

							let section_to_move = $.get(hovered_section);

							if (!section_to_move || section_to_move.index === $.get(sections).length - 1) return;

							const section_below = $.get(sections).find((s) => s.index === section_to_move.index + 1);

							if (!section_below) return;

							$.set(moving, true);
							hide_block_toolbar();
							PageSections.update(section_to_move.id, { index: section_to_move.index + 1 });
							PageSections.update(section_below.id, { index: section_to_move.index });
							await self.commit();

							setTimeout(
								() => {
									$.set(moving, false);
								},
								300
							);
						}
					}
				});
			}

			$.reset(div_1);

			$.event('mouseenter', div_1, () => {
				$.set(hovering_toolbar, true);

				// Clear any pending hide timeout when entering toolbar
				if (hide_toolbar_timeout) {
					clearTimeout(hide_toolbar_timeout);
					hide_toolbar_timeout = null;
				}
			});

			$.event('mouseleave', div_1, () => {
				$.set(hovering_toolbar, false);

				// Use the same timeout system
				if (hide_toolbar_timeout) {
					clearTimeout(hide_toolbar_timeout);
				}

				hide_toolbar_timeout = setTimeout(
					() => {
						hide_block_toolbar();
					},
					100
				);
			});

			$.append($$anchor, div_1);
		};

		$.if(node_6, ($$render) => {
			if ($.get(sections) && $.get(page_mounted) && $.get(showing_block_toolbar)) $$render(consequent_3);
		});
	}

	var main = $.sibling(node_6, 2);
	let classes;
	var node_8 = $.child(main);

	{
		var consequent_5 = ($$anchor) => {
			const show_block_toolbar_on_hover = $.derived(() => $.get(page_mounted) && !$.get(moving));
			var header = root_3();

			$.each(header, 21, () => $.get(header_sections), (page_type_section) => page_type_section.id, ($$anchor, page_type_section) => {
				const block = $.derived(() => SiteSymbols.one($.get(page_type_section).symbol));
				var fragment_5 = $.comment();
				var node_9 = $.first_child(fragment_5);

				{
					var consequent_4 = ($$anchor) => {
						var div_2 = root_2();
						var node_10 = $.child(div_2);

						ComponentNode(node_10, {
							get block() {
								return $.get(block);
							},

							get section() {
								return $.get(page_type_section);
							},

							$$events: {
								mount: () => $.update(sections_mounted),
								resize: () => {
									if ($.get(showing_block_toolbar)) {
										position_block_toolbar();
									}
								}
							}
						});

						$.reset(div_2);

						$.template_effect(() => {
							$.set_attribute(div_2, 'data-section', $.get(page_type_section).id);
							$.set_attribute(div_2, 'data-symbol', $.get(block)?.id);
						});

						$.delegated('mousemove', div_2, (e) => {
							if ($.get(show_block_toolbar_on_hover) && $.get(hovered_section_id) === $.get(page_type_section).id) {
								show_block_toolbar();
							}
						});

						$.event('mouseenter', div_2, (e) => {
							$.set(hovered_section_id, $.get(page_type_section).id, true);
							$.set(hovered_block_el, e.currentTarget, true);
							$.set(hovering_section, true);

							if ($.get(show_block_toolbar_on_hover)) {
								show_block_toolbar();
							}
						});

						$.event('mouseleave', div_2, () => {
							$.set(hovering_section, false);

							if (hide_toolbar_timeout) {
								clearTimeout(hide_toolbar_timeout);
							}

							hide_toolbar_timeout = setTimeout(
								() => {
									if ($.get(hovered_section_id) === $.get(page_type_section).id) {
										hide_block_toolbar();
									}
								},
								100
							);
						});

						$.append($$anchor, div_2);
					};

					$.if(node_9, ($$render) => {
						if ($.get(block)) $$render(consequent_4);
					});
				}

				$.append($$anchor, fragment_5);
			});

			$.reset(header);
			$.append($$anchor, header);
		};

		$.if(node_8, ($$render) => {
			if ($.get(header_sections).length > 0) $$render(consequent_5);
		});
	}

	var node_11 = $.sibling(node_8, 2);

	{
		var consequent_7 = ($$anchor) => {
			var section_1 = root_6();
			var node_12 = $.child(section_1);

			$.each(node_12, 25, () => $.get(sections).filter((s) => SiteSymbols.one(s.symbol)), (section) => section.id, ($$anchor, section) => {
				const block = $.derived(() => SiteSymbols.one($.get(section).symbol));
				const show_block_toolbar_on_hover = $.derived(() => $.get(page_mounted) && !$.get(moving));
				var div_3 = root_4();
				var node_13 = $.child(div_3);

				ComponentNode(node_13, {
					get block() {
						return $.get(block);
					},

					get section() {
						return $.get(section);
					},

					$$events: {
						mount: () => $.update(sections_mounted),
						resize: () => {
							if ($.get(showing_block_toolbar)) {
								position_block_toolbar();
							}
						}
					}
				});

				$.reset(div_3);
				$.action(div_3, ($$node, $$action_arg) => drag_item?.($$node, $$action_arg), () => $.get(section));

				$.template_effect(() => {
					$.set_attribute(div_3, 'data-section', $.get(section).id);
					$.set_attribute(div_3, 'data-symbol', $.get(block)?.id);
				});

				$.delegated('mousemove', div_3, (e) => {
					if ($.get(show_block_toolbar_on_hover) && $.get(hovered_section_id) === $.get(section).id) {
						show_block_toolbar();
					}
				});

				$.event('mouseenter', div_3, async (e) => {
					$.set(hovered_section_id, $.get(section).id, true);
					$.set(hovered_block_el, e.currentTarget, true);
					$.set(hovering_section, true);

					if ($.get(show_block_toolbar_on_hover)) {
						show_block_toolbar();
					}
				});

				$.event('mouseleave', div_3, (e) => {
					$.set(hovering_section, false);

					// Use a single timeout system
					if (hide_toolbar_timeout) {
						clearTimeout(hide_toolbar_timeout);
					}

					hide_toolbar_timeout = setTimeout(
						() => {
							// Check if we've hovered over a different section in the meantime
							if ($.get(hovered_section_id) === $.get(section).id) {
								hide_block_toolbar();
							}
						},
						100
					);
				});

				$.animation(div_3, () => flip, () => ({ duration: 100 }));
				$.append($$anchor, div_3);
			});

			var node_14 = $.sibling(node_12, 2);

			{
				var consequent_6 = ($$anchor) => {
					var div_4 = root_5();
					let classes_1;

					$.template_effect(() => classes_1 = $.set_class(div_4, 1, 'empty-state svelte-we0o6z', null, classes_1, { 'dragging-over': $.get(hovered_block_el) && $.get(dragging) }));

					$.event('mouseenter', div_4, ({ target }) => {
						$.set(hovered_block_el, target, true);
					});

					$.event('mouseleave', div_4, () => {
						$.set(hovered_block_el, null);
					});

					$.append($$anchor, div_4);
				};

				$.if(node_14, ($$render) => {
					if ($.get(sections).length === 0) $$render(consequent_6);
				});
			}

			$.reset(section_1);
			$.append($$anchor, section_1);
		};

		$.if(node_11, ($$render) => {
			if ($.get(sections)) $$render(consequent_7);
		});
	}

	var node_15 = $.sibling(node_11, 2);

	{
		var consequent_9 = ($$anchor) => {
			const show_block_toolbar_on_hover = $.derived(() => $.get(page_mounted) && !$.get(moving));
			var footer = root_8();

			$.each(footer, 21, () => $.get(footer_sections), (page_type_section) => page_type_section.id, ($$anchor, page_type_section) => {
				const block = $.derived(() => SiteSymbols.one($.get(page_type_section).symbol));
				var fragment_6 = $.comment();
				var node_16 = $.first_child(fragment_6);

				{
					var consequent_8 = ($$anchor) => {
						var div_5 = root_7();
						var node_17 = $.child(div_5);

						ComponentNode(node_17, {
							get block() {
								return $.get(block);
							},

							get section() {
								return $.get(page_type_section);
							},

							$$events: {
								lock: () => {},
								unlock: () => {},
								mount: () => $.update(sections_mounted),
								resize: () => {
									if ($.get(showing_block_toolbar)) {
										position_block_toolbar();
									}
								}
							}
						});

						$.reset(div_5);

						$.template_effect(() => {
							$.set_attribute(div_5, 'data-section', $.get(page_type_section).id);
							$.set_attribute(div_5, 'data-symbol', $.get(block)?.id);
						});

						$.delegated('mousemove', div_5, (e) => {
							if ($.get(show_block_toolbar_on_hover) && $.get(hovered_section_id) === $.get(page_type_section).id) {
								show_block_toolbar();
							}
						});

						$.event('mouseenter', div_5, (e) => {
							$.set(hovered_section_id, $.get(page_type_section).id, true);
							$.set(hovered_block_el, e.currentTarget, true);
							$.set(hovering_section, true);

							if ($.get(show_block_toolbar_on_hover)) {
								show_block_toolbar();
							}
						});

						$.event('mouseleave', div_5, () => {
							$.set(hovering_section, false);

							if (hide_toolbar_timeout) {
								clearTimeout(hide_toolbar_timeout);
							}

							hide_toolbar_timeout = setTimeout(
								() => {
									if ($.get(hovered_section_id) === $.get(page_type_section).id) {
										hide_block_toolbar();
									}
								},
								100
							);
						});

						$.append($$anchor, div_5);
					};

					$.if(node_16, ($$render) => {
						if ($.get(block)) $$render(consequent_8);
					});
				}

				$.append($$anchor, fragment_6);
			});

			$.reset(footer);
			$.append($$anchor, footer);
		};

		$.if(node_15, ($$render) => {
			if ($.get(footer_sections).length > 0) $$render(consequent_9);
		});
	}

	var node_18 = $.sibling(node_15, 2);

	{
		var consequent_10 = ($$anchor) => {
			var div_6 = root_9();

			$.html(div_6, () => $.get(site).foot, true);
			$.reset(div_6);
			$.append($$anchor, div_6);
		};

		$.if(node_18, ($$render) => {
			if ($.get(site)?.foot) $$render(consequent_10);
		});
	}

	$.reset(main);
	$.bind_this(main, ($$value) => $.set(page_el, $$value), () => $.get(page_el));
	$.action(main, ($$node) => drag_fallback?.($$node));

	$.template_effect(() => {
		$.set_attribute(main, 'lang', $locale());
		classes = $.set_class(main, 1, 'svelte-we0o6z', null, classes, { fadein: $.get(page_mounted), dragging: $dragging_symbol() });
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['mousemove']);