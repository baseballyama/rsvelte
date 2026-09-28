import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as _ from 'lodash-es';
import { tick } from 'svelte';
import { fade } from 'svelte/transition';
import { site_context, page_type_context } from '$lib/builder/stores/context';
import { flip } from 'svelte/animate';
import UI from '../../ui/index.js';
import * as Dialog from '$lib/components/ui/dialog';
import SectionEditor from '$lib/builder/views/modal/SectionEditor/SectionEditor.svelte';
import ComponentNode from './Layout/ComponentNode.svelte';
import BlockToolbar from './Layout/BlockToolbar-simple.svelte';
import DropIndicator from './Layout/DropIndicator.svelte';
import CodeEditor from '$lib/builder/components/CodeEditor/CodeMirror.svelte';
import { locale, dragging_symbol } from '../../stores/app/misc.js';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { attachClosestEdge, extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';

import {
	PageTypes,
	PageTypeSections,
	PageTypeSectionEntries,
	SiteSymbolEntries,
	Sites,
	SiteSymbols
} from '$lib/pocketbase/collections';

import { self as pb } from '$lib/pocketbase/managers';
import { setUserActivity } from '$lib/UserActivity.svelte';
import { onModKey } from '$lib/builder/utils/keyboard';
import Icon from '@iconify/svelte';
import { useCopyEntries } from '$lib/workers/CopyEntries.svelte.js';

var root = $.from_html(`<div class="spinner svelte-wiu0gb"><!></div>`);
var root_1 = $.from_html(`<div class="absolute z-50"><!></div>`);
var root_2 = $.from_html(`<div role="region" style="min-height: 3rem;overflow:hidden;position: relative;" class="svelte-wiu0gb"><!></div>`);
var root_3 = $.from_html(`<div class="empty-zone svelte-wiu0gb"><span>Drag blocks here for the header</span></div>`);
var root_4 = $.from_html(`<span class="zone-mode svelte-wiu0gb">(Static)</span>`);
var root_5 = $.from_html(`<span class="zone-mode svelte-wiu0gb">(Dynamic)</span>`);
var root_6 = $.from_html(`<span>Drag blocks here for static body content</span>`);
var root_7 = $.from_html(`<span>Drag blocks here for default body content (users can modify)</span>`);
var root_8 = $.from_html(`<div class="empty-zone main-body svelte-wiu0gb"><!></div>`);
var root_9 = $.from_html(`<div class="empty-zone svelte-wiu0gb"><span>Drag blocks here for the footer</span></div>`);
var root_10 = $.from_html(`<!> <!> <!> <!> <main id="#Page" data-test=""><div class="page-content svelte-wiu0gb"><div class="head-editor-container svelte-wiu0gb"><div class="zone-label svelte-wiu0gb">Head HTML</div> <div class="code-zone head-zone svelte-wiu0gb"><!></div> <div><span class="grab-handle svelte-wiu0gb"><!></span></div></div> <div class="zones-container svelte-wiu0gb"><div class="zone-label svelte-wiu0gb">Header</div> <section data-zone="header"><!> <!></section> <div class="zone-label svelte-wiu0gb">Body <!></div> <section data-zone="body"><!> <!></section> <div class="zone-label svelte-wiu0gb">Footer</div> <section data-zone="footer"><!> <!></section> <div class="zone-label svelte-wiu0gb">Body Footer HTML</div> <section class="code-zone foot-zone svelte-wiu0gb"><!></section></div></div></main>`, 1);

export default function PageType($$anchor, $$props) {
	$.push($$props, true);

	const $dragging_symbol = () => $.store_get(dragging_symbol, '$dragging_symbol', $$stores);
	const $locale = () => $.store_get(locale, '$locale', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	setUserActivity({ page_type: $$props.page_type.id });

	// Set context so child components can access the page type
	const context = $.proxy({ value: $$props.page_type });

	page_type_context.set(context);

	$.user_effect(() => {
		context.value = $$props.page_type;
	});

	const { value: site } = site_context.get();
	const site_symbols = $.derived(() => site?.symbols() ?? []);
	const page_type_sections = $.derived(() => $$props.page_type?.sections() ?? []);
	const page_type_symbols = $.derived(() => $$props.page_type?.symbols() ?? []);

	// Group sections by zone
	const header_sections = $.derived(() => $.get(page_type_sections).filter((s) => s.zone === 'header').sort((a, b) => a.index - b.index));

	const body_sections = $.derived(() => $.get(page_type_sections).filter((s) => s.zone === 'body').sort((a, b) => a.index - b.index));
	const footer_sections = $.derived(() => $.get(page_type_sections).filter((s) => s.zone === 'footer').sort((a, b) => a.index - b.index));

	// Page type head and foot editors
	let head = $.state($.proxy($$props.page_type.head || ''));

	let foot = $.state($.proxy($$props.page_type.foot || ''));
	let save_timeout = null;

	// Update head and foot when page type changes
	$.user_effect(() => {
		$.set(head, $$props.page_type.head || '', true);
		$.set(foot, $$props.page_type.foot || '', true);
	});

	// Head editor resize state
	const storage_key = `head-editor-height-${$$props.page_type.id}`;

	let head_editor_height = $.state($.proxy(typeof localStorage !== 'undefined'
		? parseInt(localStorage.getItem(storage_key) || '50')
		: 50));

	let is_resizing = $.state(false);
	let resize_start_y = $.state(0);
	let resize_start_height = $.state(0);
	let resize_raf = null;

	function start_resize(event) {
		$.set(is_resizing, true);
		$.set(resize_start_y, event.clientY, true);
		$.set(resize_start_height, $.get(head_editor_height), true);

		const handle_mouse_move = (e) => {
			if (!$.get(is_resizing)) return;

			// Cancel any pending animation frame
			if (resize_raf) {
				cancelAnimationFrame(resize_raf);
			}

			// Use RAF to throttle updates
			resize_raf = requestAnimationFrame(() => {
				const delta = e.clientY - $.get(resize_start_y);
				const editor_wrapper = document.querySelector('.head-editor-container .editor-wrapper');
				const max_height = editor_wrapper ? editor_wrapper.clientHeight : 600;

				$.set(head_editor_height, Math.max(0, Math.min(max_height, $.get(resize_start_height) + delta)), true);
			});
		};

		const handle_mouse_up = () => {
			$.set(is_resizing, false);
			document.removeEventListener('mousemove', handle_mouse_move);
			document.removeEventListener('mouseup', handle_mouse_up);

			// Save to localStorage
			if (typeof localStorage !== 'undefined') {
				localStorage.setItem(storage_key, $.get(head_editor_height).toString());
			}
		};

		document.addEventListener('mousemove', handle_mouse_move);
		document.addEventListener('mouseup', handle_mouse_up);
	}

	async function save_page_type_code() {
		if (!$$props.page_type) return;

		PageTypes.update($$props.page_type.id, { head: $.get(head), foot: $.get(foot) });
		await pb.commit();
	}

	// Auto-save with delay
	function debounced_save() {
		if (save_timeout) {
			clearTimeout(save_timeout);
		}

		save_timeout = setTimeout(save_page_type_code, 1000); // 1 second delay
	}

	// Watch for changes to head and foot values
	$.user_effect(() => {
		if ($$props.page_type && ($.get(head) !== $$props.page_type.head || $.get(foot) !== $$props.page_type.foot)) {
			debounced_save();
		}
	});

	// Check if page type is static (no symbols toggled)
	// Note: This relationship call might need to be replaced with direct collection access if it causes issues
	const is_static_page_type = $.derived(() => $.get(page_type_symbols).length === 0);

	// Fade in page when all components mounted
	let page_mounted = $.state(true);

	// detect when all sections are mounted
	let sections_mounted = $.state(0);

	let hovered_section_id = $.state(null);
	let hovered_section = $.derived(() => $.get(page_type_sections).find((s) => s.id === $.get(hovered_section_id)));

	// Zone-aware position calculations for toolbar
	const hovered_section_zone_position = $.derived(() => {
		if (!$.get(hovered_section_id) || !$.get(hovered_section)) return { index: 0, is_last: false };

		const section_zone = $.get(hovered_section).zone || 'body';
		const zone_sections = $.get(page_type_sections).filter((s) => (s.zone || 'body') === section_zone).sort((a, b) => a.index - b.index);
		const position = zone_sections.findIndex((s) => s.id === $.get(hovered_section_id));

		const result = {
			index: position,
			is_last: position === zone_sections.length - 1
		};

		return result;
	});

	let block_toolbar_element = $.state(void 0);
	let page_el = $.state(void 0);
	let hovered_block_el = $.state(void 0);
	let showing_block_toolbar = $.state(false);
	let hovering_toolbar = $.state(false);

	// Handle unsaved changes for section editor
	let section_has_unsaved_changes = $.state(false);

	async function show_block_toolbar() {
		$.set(showing_block_toolbar, true);
		await tick();
		position_block_toolbar();

		$.get(page_el).addEventListener('scroll', () => {
			$.set(showing_block_toolbar, false);
		});
	}

	function position_block_toolbar() {
		if (!$.get(hovered_block_el)) return;

		const { top, left, bottom, right } = $.get(hovered_block_el).getBoundingClientRect();

		const block_positions = {
			top: (top <= 43 ? 43 : top) + window.scrollY,
			bottom: bottom >= window.innerHeight ? 0 : window.innerHeight - bottom,
			left,
			right: window.innerWidth - right - window.scrollX
		};

		// Just update the styles without appending
		if ($.get(block_toolbar_element)) {
			$.get(block_toolbar_element).style.top = `${block_positions.top}px`;
			$.get(block_toolbar_element).style.bottom = `${block_positions.bottom}px`;
			$.get(block_toolbar_element).style.left = `${block_positions.left}px`;
			$.get(block_toolbar_element).style.right = `${block_positions.right}px`;
		}
	}

	let hide_toolbar_timeout = null;

	function hide_block_toolbar() {
		// Clear any existing timeout
		if (hide_toolbar_timeout) {
			clearTimeout(hide_toolbar_timeout);
		}

		// Hide immediately without delay
		if (!$.get(hovering_toolbar)) {
			$.set(showing_block_toolbar, false);
		}
	}

	let editing_section_tab = $.state('code');

	function edit_component(tab) {
		if (!$.get(hovered_section)) return;

		$.set(editing_section_tab, tab, true);
		$.set(editing_section, true);
		$.set(editing_section_target, $.get(hovered_section), true);
	}

	// Listen for Command-E hotkey to open section editor when hovered
	onModKey('e', () => {
		if ($.get(hovered_section) && $.get(hovered_section).id && $.get(showing_block_toolbar)) {
			$.set(editing_section_target, $.get(hovered_section), true);
			$.set(editing_section_tab, 'code');
			$.set(editing_section, true);
		}
	});

	let moving = $.state(false // workaround to prevent block toolbar from showing when moving blocks
	);

	// using instead of <svelte:head> to enable script tags
	function append_to_head(code) {
		const temp_container = document.createElement('div');

		temp_container.innerHTML = code;

		const elements = Array.from(temp_container.childNodes);
		const scripts = [];

		elements.forEach((child) => {
			if (child.tagName === 'SCRIPT') {
				scripts.push(child);
			} else {
				document.head.appendChild(child);
			}
		});

		function load_script(script_element) {
			return new Promise((resolve) => {
				const new_script = document.createElement('script');

				Array.from(script_element.attributes).forEach((attr) => {
					new_script.setAttribute(attr.name, attr.value);
				});

				if (script_element.src) {
					new_script.onload = resolve;
					new_script.onerror = resolve; // Proceed even if a script fails to load
				} else {
					new_script.textContent = script_element.textContent;
				}

				document.head.appendChild(new_script);

				if (!script_element.src) {
					resolve();
				}
			});
		}

		scripts.reduce(
			(promise, script_element) => {
				return promise.then(() => load_script(script_element));
			},
			Promise.resolve()
		);
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
			$.get(page_el).addEventListener('scroll', position_drop_indicator);

			// Reset display when showing
			if ($.get(drop_indicator_element)) {
				$.get(drop_indicator_element).style.display = 'block';
			}
		}
	}

	function position_drop_indicator() {
		if (!$.get(hovered_block_el // hovering over page (i.e. below sections)
		) || !$.get(drop_indicator_element)) return;

		// Only append if not already a child to avoid errors
		if ($.get(drop_indicator_element).parentNode !== $.get(hovered_block_el)) {
			$.get(hovered_block_el).appendChild($.get(drop_indicator_element));
		}

		const { top, left, bottom, right } = $.get(hovered_block_el).getBoundingClientRect();

		const block_positions = {
			top: (top <= 56 ? 56 : top) + window.scrollY,
			bottom: bottom >= window.innerHeight ? 0 : window.innerHeight - bottom,
			left,
			right: window.innerWidth - right - window.scrollX
		};

		$.get(drop_indicator_element).style.left = `${block_positions.left}px`;
		$.get(drop_indicator_element).style.right = `${block_positions.right}px`;

		// surround placeholder palette
		if ($.get(dragging).position === 'top' || !$.get(page_type_sections).length) {
			$.get(drop_indicator_element).style.top = `${block_positions.top}px`;
		} else {
			$.get(drop_indicator_element).style.top = `initial`;
		}

		if ($.get(dragging).position === 'bottom' || !$.get(page_type_sections).length) {
			$.get(drop_indicator_element).style.bottom = `${block_positions.bottom}px`;
		} else {
			$.get(drop_indicator_element).style.bottom = `initial`;
		}
	}

	function hide_drop_indicator() {
		$.set(showing_drop_indicator, false);
		$.get(page_el).removeEventListener('scroll', position_drop_indicator);

		// Force reset the drop indicator element position
		if ($.get(drop_indicator_element)) {
			$.get(drop_indicator_element).style.display = 'none';
			$.get(drop_indicator_element).style.left = '-9999px';
			$.get(drop_indicator_element).style.top = '-9999px';
		}
	}

	// Simple drag state tracking
	let dragging_over_section = $.state(false);

	let hovering_over_zone = $.state(null);
	let dragging = $.state($.proxy({ id: null, position: null }));

	// Clean up when global drag ends
	$.user_effect(() => {
		if (!$dragging_symbol()) {
			// Drag ended, clean up everything
			hide_drop_indicator();

			$.set(dragging_over_section, false);
			$.set(hovering_over_zone, null);
			$.set(dragging, { id: null, position: null }, true);
		}
	});

	// Empty zone drop handler
	function empty_zone_drop(element, zone) {
		dropTargetForElements({
			element,
			getData() {
				return { zone };
			},

			onDragEnter({ source }) {
				if (source.data?.block) {
					$.set(hovering_over_zone, zone, true);
				}
			},

			onDragLeave({ source }) {
				if (source.data?.block) {
					$.set(hovering_over_zone, null);
					hide_drop_indicator();
				}
			},

			async onDrop({ source }) {
				if (!source.data?.block || !$$props.page_type) return;

				const block_being_dragged = source.data.block;
				const zone_sections = $.get(page_type_sections).filter((s) => (s.zone || 'body') === zone);
				const target_index = zone_sections.length;

				try {
					const new_section = PageTypeSections.create({
						page_type: $$props.page_type.id,
						symbol: block_being_dragged.id,
						index: target_index,
						zone
					});

					if (new_section) {
						await copy_symbol_entries_to_section(block_being_dragged.id, new_section.id);
					}

					await pb.commit();
				} catch(error) {
					console.error('Database insertion error (empty zone):', error);

					throw error;
				}

				// Clean up drag state
				hide_drop_indicator();

				$.set(dragging_over_section, false);
				$.set(hovering_over_zone, null);
			}
		});
	}

	function drag_item(element, section) {
		if (!element) return;

		dropTargetForElements({
			element,
			getData({ input, element }) {
				return attachClosestEdge({ section }, { element, input, allowedEdges: ['top', 'bottom'] });
			},

			canDrop({ source }) {
				// Explicitly allow drops if a block is being dragged
				const canDrop = !!source.data?.block;

				return canDrop;
			},

			onDragEnter({ source }) {
				if (source.data?.block) {
					$.set(dragging_over_section, true);
					$.set(hovering_over_zone, section.zone || 'body', true);
				}
			},

			onDragLeave({ source }) {
				if (source.data?.block) {
					$.set(dragging_over_section, false);
					$.set(hovering_over_zone, null);

					// Hide drop indicator when leaving section
					setTimeout(
						() => {
							if (!$.get(dragging_over_section)) {
								hide_drop_indicator();
							}
						},
						50
					);
				}
			},

			async onDrag({ self, source }) {
				if (!source.data?.block) return;

				$.set(hovered_block_el, self.element, true);

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

				// Show drop indicator
				if (!$.get(showing_drop_indicator)) {
					await show_drop_indicator();
				}

				position_drop_indicator();
			},

			async onDrop({ self, source }) {
				if (!source.data?.block || !$$props.page_type) return;

				const block_being_dragged = source.data.block;
				const section_dragged_over = self.data.section;
				const closestEdgeOfTarget = extractClosestEdge(self.data);
				const section_zone = section_dragged_over.zone || 'body';

				// Get sections in this zone, sorted by index
				const zone_sections = $.get(page_type_sections).filter((s) => (s.zone || 'body') === section_zone).sort((a, b) => a.index - b.index);

				// Find the position of the dragged-over section within this zone
				const section_position_in_zone = zone_sections.findIndex((s) => s.id === section_dragged_over.id);

				const target_position = closestEdgeOfTarget === 'top'
					? section_position_in_zone
					: section_position_in_zone + 1;

				try {
					// Create new section first to avoid visual jumps
					const new_section = PageTypeSections.create({
						page_type: $$props.page_type.id,
						symbol: block_being_dragged.id,
						index: target_position,
						zone: section_zone
					});

					if (new_section) {
						await copy_symbol_entries_to_section(block_being_dragged.id, new_section.id);
					}

					// Update indices of existing sections in this zone that come after the insertion position
					const sections_to_update = zone_sections.slice(target_position);

					for (const section of sections_to_update) {
						PageTypeSections.update(section.id, { index: section.index + 1 });
					}

					await pb.commit();
				} catch(error) {
					console.error('Database insertion error:', error);

					throw error;
				}

				// Clean up drag state
				hide_drop_indicator();

				$.set(dragging_over_section, false);
				$.set(hovering_over_zone, null);
			}
		});
	}

	$.user_effect(() => {
		if ($.get(sections_mounted) === $$props.page_type?.sections.length && $.get(sections_mounted) !== 0) {
			$.set(page_mounted, true);
		}
	});

	let editing_section = $.state(false);
	let editing_section_target = $.state(void 0);
	let copying_entries = $.state(false);
	let source_symbol_id = $.state(void 0);
	let destination_section_id = $.state(void 0);
	const source_symbol = $.derived(() => $.get(source_symbol_id) ? SiteSymbols.one($.get(source_symbol_id)) : undefined);

	const destination_section = $.derived(() => $.get(destination_section_id)
		? PageTypeSections.one($.get(destination_section_id))
		: undefined);

	const copy_symbol_entries = $.derived(() => useCopyEntries([$.get(source_symbol)]));

	// Establish reactive dependency for copy_symbol_entries worker
	$.user_effect(() => {
		$.get(copy_symbol_entries);
	});

	async function copy_symbol_entries_to_section(symbol_id, section_id) {
		$.set(source_symbol_id, symbol_id, true);
		$.set(destination_section_id, section_id, true);
	}

	$.user_effect(() => {
		if (!$.get(source_symbol)) return;
		if (!$.get(destination_section)) return;
		if ($.get(copying_entries)) return;

		$.set(copying_entries, true);

		$.get(copy_symbol_entries).run($.get(source_symbol), $.get(destination_section)).catch((error) => {
			console.error('Failed to copy symbol entries:', error);
		}).finally(() => {
			$.set(source_symbol_id, undefined);
			$.set(destination_section_id, undefined);
			$.set(copying_entries, false);
		});
	});

	var fragment = root_10();
	var node = $.first_child(fragment);

	$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
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
						pb.discard();
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
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'z-[999] w-[calc(100vw_-_1rem)] max-w-none h-[calc(100vh_-_1rem)] flex flex-col p-2 gap-2',
						children: ($$anchor, $$slotProps) => {
							SectionEditor($$anchor, {
								get component() {
									return $.get(editing_section_target);
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

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_2 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var node_3 = $.child(div);

			$.component(node_3, () => UI.Spinner, ($$anchor, UI_Spinner) => {
				UI_Spinner($$anchor, { variant: 'loop' });
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node_2, ($$render) => {
			if (!$.get(page_mounted) && $$props.page_type?.sections.length) $$render(consequent);
		});
	}

	var node_4 = $.sibling(node_2, 2);

	{
		var consequent_1 = ($$anchor) => {
			DropIndicator($$anchor, {
				get node() {
					return $.get(drop_indicator_element);
				},

				set node($$value) {
					$.set(drop_indicator_element, $$value, true);
				}
			});
		};

		var alternate = ($$anchor) => {};

		$.if(node_4, ($$render) => {
			if ($.get(showing_drop_indicator)) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	var node_5 = $.sibling(node_4, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_1 = root_1();
			var node_6 = $.child(div_1);

			BlockToolbar(node_6, {
				get id() {
					return $.get(hovered_section_id);
				},

				get i() {
					return $.get(hovered_section_zone_position).index;
				},

				get is_last() {
					return $.get(hovered_section_zone_position).is_last;
				},

				get node() {
					return $.get(block_toolbar_element);
				},

				set node($$value) {
					$.set(block_toolbar_element, $$value, true);
				},

				$$events: {
					delete: async () => {
						if (!$.get(hovered_section_id)) return;

						const section_to_delete = $.get(page_type_sections).find((s) => s.id === $.get(hovered_section_id));

						if (!section_to_delete) return;

						const section_id = $.get(hovered_section_id);

						$.set(showing_block_toolbar, false);
						$.set(hovered_section_id, null);

						// Delete the section
						PageTypeSections.delete(section_id);

						// Reindex sections in the same zone that come after the deleted section
						const section_zone = section_to_delete.zone || 'body';

						const zone_sections = $.get(page_type_sections).filter((s) => (s.zone || 'body') === section_zone && s.id !== section_id).sort((a, b) => a.index - b.index);

						// Update indices of sections that come after the deleted section
						const sections_after_deleted = zone_sections.filter((s) => s.index > section_to_delete.index);

						for (const section of sections_after_deleted) {
							PageTypeSections.update(section.id, { index: section.index - 1 });
						}

						await pb.commit();
					},
					'edit-code': () => edit_component('code'),
					'edit-content': () => edit_component('content'),
					moveUp: async () => {
						if (!$.get(hovered_section_id)) return;

						$.set(moving, true);
						hide_block_toolbar();

						const section = $.get(page_type_sections).find((s) => s.id === $.get(hovered_section_id));

						if (!section) return;

						const section_zone = section.zone || 'body';
						const zone_sections = $.get(page_type_sections).filter((s) => (s.zone || 'body') === section_zone).sort((a, b) => a.index - b.index);
						const current_position = zone_sections.findIndex((s) => s.id === section.id);

						if (current_position > 0) {
							// Three-step swap to avoid unique constraint violation
							const section_above = zone_sections[current_position - 1];

							const section_index = section.index;
							const above_index = section_above.index;

							// Find a temporary index that won't conflict (use max + 1000)
							const max_index = Math.max(...zone_sections.map((s) => s.index));

							const temp_index = max_index + 1000;

							// Step 1: Move current section to temp position and commit
							PageTypeSections.update(section.id, { index: temp_index });

							await pb.commit();

							// Step 2: Move above section to current position and commit
							PageTypeSections.update(section_above.id, { index: section_index });

							await pb.commit();

							// Step 3: Move current section to above position and commit
							PageTypeSections.update(section.id, { index: above_index });

							await pb.commit();
						}

						setTimeout(
							() => {
								$.set(moving, false);
							},
							300
						);
					},

					moveDown: async () => {
						if (!$.get(hovered_section_id)) return;

						$.set(moving, true);
						hide_block_toolbar();

						const section = $.get(page_type_sections).find((s) => s.id === $.get(hovered_section_id));

						if (!section) return;

						const section_zone = section.zone || 'body';
						const zone_sections = $.get(page_type_sections).filter((s) => (s.zone || 'body') === section_zone).sort((a, b) => a.index - b.index);
						const current_position = zone_sections.findIndex((s) => s.id === section.id);

						if (current_position < zone_sections.length - 1) {
							// Three-step swap to avoid unique constraint violation
							const section_below = zone_sections[current_position + 1];

							const section_index = section.index;
							const below_index = section_below.index;

							// Find a temporary index that won't conflict (use max + 1000)
							const max_index = Math.max(...zone_sections.map((s) => s.index));

							const temp_index = max_index + 1000;

							// Step 1: Move current section to temp position and commit
							PageTypeSections.update(section.id, { index: temp_index });

							await pb.commit();

							// Step 2: Move below section to current position and commit
							PageTypeSections.update(section_below.id, { index: section_index });

							await pb.commit();

							// Step 3: Move current section to below position and commit
							PageTypeSections.update(section.id, { index: below_index });

							await pb.commit();
						}

						setTimeout(
							() => {
								$.set(moving, false);
							},
							300
						);
					}
				}
			});

			$.reset(div_1);

			$.event('mouseenter', div_1, () => {
				$.set(hovering_toolbar, true);
			});

			$.event('mouseleave', div_1, () => {
				$.set(hovering_toolbar, false);
				$.set(showing_block_toolbar, false);
			});

			$.append($$anchor, div_1);
		};

		$.if(node_5, ($$render) => {
			if ($.get(showing_block_toolbar)) $$render(consequent_2);
		});
	}

	var main = $.sibling(node_5, 2);
	let classes;
	var div_2 = $.child(main);
	var div_3 = $.child(div_2);
	var div_4 = $.sibling($.child(div_3), 2);
	var node_7 = $.child(div_4);

	CodeEditor(node_7, {
		mode: 'html',
		get value() {
			return $.get(head);
		},

		set value($$value) {
			$.set(head, $$value, true);
		},
		$$events: { save: save_page_type_code }
	});

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	let classes_1;
	var span = $.child(div_5);
	var node_8 = $.child(span);

	Icon(node_8, { icon: 'mdi:drag-vertical-variant' });
	$.reset(span);
	$.reset(div_5);
	$.reset(div_3);

	var div_6 = $.sibling(div_3, 2);
	var section_1 = $.sibling($.child(div_6), 2);
	let classes_2;
	var node_9 = $.child(section_1);

	$.each(node_9, 25, () => $.get(header_sections), (section) => section.id, ($$anchor, section) => {
		const symbol = $.derived(() => $.get(site_symbols).find((s) => s.id === $.get(section).symbol));
		var div_7 = root_2();
		var node_10 = $.child(div_7);

		{
			var consequent_3 = ($$anchor) => {
				ComponentNode($$anchor, {
					get section() {
						return $.get(section);
					},

					get block() {
						return $.get(symbol);
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
			};

			$.if(node_10, ($$render) => {
				if ($.get(symbol)) $$render(consequent_3);
			});
		}

		$.reset(div_7);
		$.action(div_7, ($$node, $$action_arg) => drag_item?.($$node, $$action_arg), () => $.get(section));

		$.template_effect(() => {
			$.set_attribute(div_7, 'data-section', $.get(section).id);
			$.set_attribute(div_7, 'data-symbol', $.get(symbol)?.id);
			$.set_attribute(div_7, 'id', `section-${$.get(section).id ?? ''}`);
			$.set_attribute(div_7, 'data-test-id', `page-type-section-${$.get(section).id ?? ''}`);
		});

		$.delegated('mousemove', div_7, () => {
			if (!$.get(moving) && !$.get(showing_block_toolbar)) {
				show_block_toolbar();
			}
		});

		$.event('mouseenter', div_7, async ({ target }) => {
			$.set(hovered_section_id, $.get(section).id, true);
			$.set(hovered_block_el, target, true);

			if (!$.get(moving)) {
				show_block_toolbar();
			}
		});

		$.event('mouseleave', div_7, () => {
			setTimeout(
				() => {
					if ($.get(hovered_section_id) === $.get(section).id) {
						hide_block_toolbar();
					}
				},
				50
			);
		});

		$.animation(div_7, () => flip, () => ({ duration: 100 }));
		$.append($$anchor, div_7);
	});

	var node_11 = $.sibling(node_9, 2);

	{
		var consequent_4 = ($$anchor) => {
			var div_8 = root_3();

			$.action(div_8, ($$node, $$action_arg) => empty_zone_drop?.($$node, $$action_arg), () => 'header');
			$.append($$anchor, div_8);
		};

		$.if(node_11, ($$render) => {
			if ($.get(header_sections).length === 0) $$render(consequent_4);
		});
	}

	$.reset(section_1);

	var div_9 = $.sibling(section_1, 2);
	var node_12 = $.sibling($.child(div_9));

	{
		var consequent_5 = ($$anchor) => {
			var span_1 = root_4();

			$.append($$anchor, span_1);
		};

		var alternate_1 = ($$anchor) => {
			var span_2 = root_5();

			$.append($$anchor, span_2);
		};

		$.if(node_12, ($$render) => {
			if ($.get(is_static_page_type)) $$render(consequent_5); else $$render(alternate_1, -1);
		});
	}

	$.reset(div_9);

	var section_2 = $.sibling(div_9, 2);
	let classes_3;
	var node_13 = $.child(section_2);

	$.each(node_13, 25, () => $.get(body_sections), (section) => section.id, ($$anchor, section) => {
		const symbol = $.derived(() => $.get(site_symbols).find((s) => s.id === $.get(section).symbol));
		var div_10 = root_2();
		var node_14 = $.child(div_10);

		{
			var consequent_6 = ($$anchor) => {
				ComponentNode($$anchor, {
					get section() {
						return $.get(section);
					},

					get block() {
						return $.get(symbol);
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
			};

			$.if(node_14, ($$render) => {
				if ($.get(symbol)) $$render(consequent_6);
			});
		}

		$.reset(div_10);
		$.action(div_10, ($$node, $$action_arg) => drag_item?.($$node, $$action_arg), () => $.get(section));

		$.template_effect(() => {
			$.set_attribute(div_10, 'data-section', $.get(section).id);
			$.set_attribute(div_10, 'data-symbol', $.get(symbol)?.id);
			$.set_attribute(div_10, 'id', `section-${$.get(section).id ?? ''}`);
			$.set_attribute(div_10, 'data-test-id', `page-type-section-${$.get(section).id ?? ''}`);
		});

		$.delegated('mousemove', div_10, () => {
			if (!$.get(moving) && !$.get(showing_block_toolbar)) {
				show_block_toolbar();
			}
		});

		$.event('mouseenter', div_10, async ({ target }) => {
			$.set(hovered_section_id, $.get(section).id, true);
			$.set(hovered_block_el, target, true);

			if (!$.get(moving)) {
				show_block_toolbar();
			}
		});

		$.event('mouseleave', div_10, () => {
			setTimeout(
				() => {
					if ($.get(hovered_section_id) === $.get(section).id) {
						hide_block_toolbar();
					}
				},
				50
			);
		});

		$.animation(div_10, () => flip, () => ({ duration: 100 }));
		$.append($$anchor, div_10);
	});

	var node_15 = $.sibling(node_13, 2);

	{
		var consequent_8 = ($$anchor) => {
			var div_11 = root_8();
			var node_16 = $.child(div_11);

			{
				var consequent_7 = ($$anchor) => {
					var span_3 = root_6();

					$.append($$anchor, span_3);
				};

				var alternate_2 = ($$anchor) => {
					var span_4 = root_7();

					$.append($$anchor, span_4);
				};

				$.if(node_16, ($$render) => {
					if ($.get(is_static_page_type)) $$render(consequent_7); else $$render(alternate_2, -1);
				});
			}

			$.reset(div_11);
			$.action(div_11, ($$node, $$action_arg) => empty_zone_drop?.($$node, $$action_arg), () => 'body');
			$.append($$anchor, div_11);
		};

		$.if(node_15, ($$render) => {
			if ($.get(body_sections).length === 0) $$render(consequent_8);
		});
	}

	$.reset(section_2);

	var section_3 = $.sibling(section_2, 4);
	let classes_4;
	var node_17 = $.child(section_3);

	$.each(node_17, 25, () => $.get(footer_sections), (section) => section.id, ($$anchor, section) => {
		const symbol = $.derived(() => $.get(site_symbols).find((s) => s.id === $.get(section).symbol));
		var div_12 = root_2();
		var node_18 = $.child(div_12);

		{
			var consequent_9 = ($$anchor) => {
				ComponentNode($$anchor, {
					get section() {
						return $.get(section);
					},

					get block() {
						return $.get(symbol);
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
			};

			$.if(node_18, ($$render) => {
				if ($.get(symbol)) $$render(consequent_9);
			});
		}

		$.reset(div_12);
		$.action(div_12, ($$node, $$action_arg) => drag_item?.($$node, $$action_arg), () => $.get(section));

		$.template_effect(() => {
			$.set_attribute(div_12, 'data-section', $.get(section).id);
			$.set_attribute(div_12, 'data-symbol', $.get(symbol)?.id);
			$.set_attribute(div_12, 'id', `section-${$.get(section).id ?? ''}`);
			$.set_attribute(div_12, 'data-test-id', `page-type-section-${$.get(section).id ?? ''}`);
		});

		$.delegated('mousemove', div_12, () => {
			if (!$.get(moving) && !$.get(showing_block_toolbar)) {
				show_block_toolbar();
			}
		});

		$.event('mouseenter', div_12, async ({ target }) => {
			$.set(hovered_section_id, $.get(section).id, true);
			$.set(hovered_block_el, target, true);

			if (!$.get(moving)) {
				show_block_toolbar();
			}
		});

		$.event('mouseleave', div_12, () => {
			setTimeout(
				() => {
					if ($.get(hovered_section_id) === $.get(section).id) {
						hide_block_toolbar();
					}
				},
				50
			);
		});

		$.animation(div_12, () => flip, () => ({ duration: 100 }));
		$.append($$anchor, div_12);
	});

	var node_19 = $.sibling(node_17, 2);

	{
		var consequent_10 = ($$anchor) => {
			var div_13 = root_9();

			$.action(div_13, ($$node, $$action_arg) => empty_zone_drop?.($$node, $$action_arg), () => 'footer');
			$.append($$anchor, div_13);
		};

		$.if(node_19, ($$render) => {
			if ($.get(footer_sections).length === 0) $$render(consequent_10);
		});
	}

	$.reset(section_3);

	var section_4 = $.sibling(section_3, 4);
	var node_20 = $.child(section_4);

	CodeEditor(node_20, {
		mode: 'html',
		get value() {
			return $.get(foot);
		},

		set value($$value) {
			$.set(foot, $$value, true);
		},
		$$events: { save: save_page_type_code }
	});

	$.reset(section_4);
	$.reset(div_6);
	$.reset(div_2);
	$.reset(main);
	$.bind_this(main, ($$value) => $.set(page_el, $$value), () => $.get(page_el));

	$.template_effect(() => {
		$.set_attribute(main, 'lang', $locale());

		classes = $.set_class(main, 1, 'svelte-wiu0gb', null, classes, {
			fadein: $.get(page_mounted),
			dragging: $dragging_symbol(),
			'resizing-editor': $.get(is_resizing)
		});

		$.set_style(div_4, `height: ${$.get(head_editor_height) ?? ''}px;`);
		classes_1 = $.set_class(div_5, 1, 'resize-handle svelte-wiu0gb', null, classes_1, { resizing: $.get(is_resizing) });
		classes_2 = $.set_class(section_1, 1, 'page-zone header-zone svelte-wiu0gb', null, classes_2, { 'dragging-over': $.get(hovering_over_zone) === 'header' });
		classes_3 = $.set_class(section_2, 1, 'page-zone body-zone svelte-wiu0gb', null, classes_3, { 'dragging-over': $.get(hovering_over_zone) === 'body' });
		classes_4 = $.set_class(section_3, 1, 'page-zone footer-zone svelte-wiu0gb', null, classes_4, { 'dragging-over': $.get(hovering_over_zone) === 'footer' });
	});

	$.delegated('mousedown', div_5, start_resize);
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['mousedown', 'mousemove']);