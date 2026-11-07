import * as $ from 'svelte/internal/server';
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

export default function PageType($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { page_type } = $$props;

		setUserActivity({ page_type: page_type.id });

		// Set context so child components can access the page type
		const context = { value: page_type };

		page_type_context.set(context);

		const { value: site } = site_context.get();
		const site_symbols = $.derived(() => site?.symbols() ?? []);
		const page_type_sections = $.derived(() => page_type?.sections() ?? []);
		const page_type_symbols = $.derived(() => page_type?.symbols() ?? []);

		// Group sections by zone
		const header_sections = $.derived(() => page_type_sections().filter((s) => s.zone === 'header').sort((a, b) => a.index - b.index));

		const body_sections = $.derived(() => page_type_sections().filter((s) => s.zone === 'body').sort((a, b) => a.index - b.index));
		const footer_sections = $.derived(() => page_type_sections().filter((s) => s.zone === 'footer').sort((a, b) => a.index - b.index));

		// Page type head and foot editors
		let head = page_type.head || '';

		let foot = page_type.foot || '';
		let save_timeout = null;

		// Update head and foot when page type changes
		// Head editor resize state
		const storage_key = `head-editor-height-${page_type.id}`;

		let head_editor_height = typeof localStorage !== 'undefined'
			? parseInt(localStorage.getItem(storage_key) || '50')
			: 50;

		let is_resizing = false;
		let resize_start_y = 0;
		let resize_start_height = 0;
		let resize_raf = null;

		function start_resize(event) {
			is_resizing = true;
			resize_start_y = event.clientY;
			resize_start_height = head_editor_height;

			const handle_mouse_move = (e) => {
				if (!is_resizing) return;

				// Cancel any pending animation frame
				if (resize_raf) {
					cancelAnimationFrame(resize_raf);
				}

				// Use RAF to throttle updates
				resize_raf = requestAnimationFrame(() => {
					const delta = e.clientY - resize_start_y;
					const editor_wrapper = document.querySelector('.head-editor-container .editor-wrapper');
					const max_height = editor_wrapper ? editor_wrapper.clientHeight : 600;

					head_editor_height = Math.max(0, Math.min(max_height, resize_start_height + delta));
				});
			};

			const handle_mouse_up = () => {
				is_resizing = false;
				document.removeEventListener('mousemove', handle_mouse_move);
				document.removeEventListener('mouseup', handle_mouse_up);

				// Save to localStorage
				if (typeof localStorage !== 'undefined') {
					localStorage.setItem(storage_key, head_editor_height.toString());
				}
			};

			document.addEventListener('mousemove', handle_mouse_move);
			document.addEventListener('mouseup', handle_mouse_up);
		}

		async function save_page_type_code() {
			if (!page_type) return;

			PageTypes.update(page_type.id, { head, foot });
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
		// Check if page type is static (no symbols toggled)
		// Note: This relationship call might need to be replaced with direct collection access if it causes issues
		const is_static_page_type = $.derived(() => page_type_symbols().length === 0);

		// Fade in page when all components mounted
		let page_mounted = true;

		// detect when all sections are mounted
		let sections_mounted = 0;

		let hovered_section_id = null;
		let hovered_section = $.derived(() => page_type_sections().find((s) => s.id === hovered_section_id));

		// Zone-aware position calculations for toolbar
		const hovered_section_zone_position = $.derived(() => {
			if (!hovered_section_id || !hovered_section()) return { index: 0, is_last: false };

			const section_zone = hovered_section().zone || 'body';
			const zone_sections = page_type_sections().filter((s) => (s.zone || 'body') === section_zone).sort((a, b) => a.index - b.index);
			const position = zone_sections.findIndex((s) => s.id === hovered_section_id);

			const result = {
				index: position,
				is_last: position === zone_sections.length - 1
			};

			return result;
		});

		let block_toolbar_element = void 0;
		let page_el = void 0;
		let hovered_block_el = void 0;
		let showing_block_toolbar = false;
		let hovering_toolbar = false;

		// Handle unsaved changes for section editor
		let section_has_unsaved_changes = false;

		async function show_block_toolbar() {
			showing_block_toolbar = true;
			await tick();
			position_block_toolbar();

			page_el.addEventListener('scroll', () => {
				showing_block_toolbar = false;
			});
		}

		function position_block_toolbar() {
			if (!hovered_block_el) return;

			const { top, left, bottom, right } = hovered_block_el.getBoundingClientRect();

			const block_positions = {
				top: (top <= 43 ? 43 : top) + window.scrollY,
				bottom: bottom >= window.innerHeight ? 0 : window.innerHeight - bottom,
				left,
				right: window.innerWidth - right - window.scrollX
			};

			// Just update the styles without appending
			if (block_toolbar_element) {
				block_toolbar_element.style.top = `${block_positions.top}px`;
				block_toolbar_element.style.bottom = `${block_positions.bottom}px`;
				block_toolbar_element.style.left = `${block_positions.left}px`;
				block_toolbar_element.style.right = `${block_positions.right}px`;
			}
		}

		let hide_toolbar_timeout = null;

		function hide_block_toolbar() {
			// Clear any existing timeout
			if (hide_toolbar_timeout) {
				clearTimeout(hide_toolbar_timeout);
			}

			// Hide immediately without delay
			if (!hovering_toolbar) {
				showing_block_toolbar = false;
			}
		}

		let editing_section_tab = 'code';

		function edit_component(tab) {
			if (!hovered_section()) return;

			editing_section_tab = tab;
			editing_section = true;
			editing_section_target = hovered_section();
		}

		// Listen for Command-E hotkey to open section editor when hovered
		onModKey('e', () => {
			if (hovered_section() && hovered_section().id && showing_block_toolbar) {
				editing_section_target = hovered_section();
				editing_section_tab = 'code';
				editing_section = true;
			}
		});

		let moving = false; // workaround to prevent block toolbar from showing when moving blocks

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
		let drop_indicator_element = void 0;

		let showing_drop_indicator = false;

		async function show_drop_indicator() {
			if (!showing_drop_indicator) {
				showing_drop_indicator = true;
				await tick();
				page_el.addEventListener('scroll', position_drop_indicator);

				// Reset display when showing
				if (drop_indicator_element) {
					drop_indicator_element.style.display = 'block';
				}
			}
		}

		function position_drop_indicator() {
			if (!hovered_block_el || !drop_indicator_element) return; // hovering over page (i.e. below sections)

			// Only append if not already a child to avoid errors
			if (drop_indicator_element.parentNode !== hovered_block_el) {
				hovered_block_el.appendChild(drop_indicator_element);
			}

			const { top, left, bottom, right } = hovered_block_el.getBoundingClientRect();

			const block_positions = {
				top: (top <= 56 ? 56 : top) + window.scrollY,
				bottom: bottom >= window.innerHeight ? 0 : window.innerHeight - bottom,
				left,
				right: window.innerWidth - right - window.scrollX
			};

			drop_indicator_element.style.left = `${block_positions.left}px`;
			drop_indicator_element.style.right = `${block_positions.right}px`;

			// surround placeholder palette
			if (dragging.position === 'top' || !page_type_sections().length) {
				drop_indicator_element.style.top = `${block_positions.top}px`;
			} else {
				drop_indicator_element.style.top = `initial`;
			}

			if (dragging.position === 'bottom' || !page_type_sections().length) {
				drop_indicator_element.style.bottom = `${block_positions.bottom}px`;
			} else {
				drop_indicator_element.style.bottom = `initial`;
			}
		}

		function hide_drop_indicator() {
			showing_drop_indicator = false;
			page_el.removeEventListener('scroll', position_drop_indicator);

			// Force reset the drop indicator element position
			if (drop_indicator_element) {
				drop_indicator_element.style.display = 'none';
				drop_indicator_element.style.left = '-9999px';
				drop_indicator_element.style.top = '-9999px';
			}
		}

		// Simple drag state tracking
		let dragging_over_section = false;

		let hovering_over_zone = null;
		let dragging = { id: null, position: null };

		// Clean up when global drag ends
		// Drag ended, clean up everything
		// Empty zone drop handler
		function empty_zone_drop(element, zone) {
			dropTargetForElements({
				element,
				getData() {
					return { zone };
				},

				onDragEnter({ source }) {
					if (source.data?.block) {
						hovering_over_zone = zone;
					}
				},

				onDragLeave({ source }) {
					if (source.data?.block) {
						hovering_over_zone = null;
						hide_drop_indicator();
					}
				},

				async onDrop({ source }) {
					if (!source.data?.block || !page_type) return;

					const block_being_dragged = source.data.block;
					const zone_sections = page_type_sections().filter((s) => (s.zone || 'body') === zone);
					const target_index = zone_sections.length;

					try {
						const new_section = PageTypeSections.create({
							page_type: page_type.id,
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

					dragging_over_section = false;
					hovering_over_zone = null;
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
						dragging_over_section = true;
						hovering_over_zone = section.zone || 'body';
					}
				},

				onDragLeave({ source }) {
					if (source.data?.block) {
						dragging_over_section = false;
						hovering_over_zone = null;

						// Hide drop indicator when leaving section
						setTimeout(
							() => {
								if (!dragging_over_section) {
									hide_drop_indicator();
								}
							},
							50
						);
					}
				},

				async onDrag({ self, source }) {
					if (!source.data?.block) return;

					hovered_block_el = self.element;

					if (dragging.id !== self.data.section.id || dragging.position !== extractClosestEdge(self.data)) {
						dragging = {
							id: self.data.section.id,
							position: extractClosestEdge(self.data)
						};
					}

					// Show drop indicator
					if (!showing_drop_indicator) {
						await show_drop_indicator();
					}

					position_drop_indicator();
				},

				async onDrop({ self, source }) {
					if (!source.data?.block || !page_type) return;

					const block_being_dragged = source.data.block;
					const section_dragged_over = self.data.section;
					const closestEdgeOfTarget = extractClosestEdge(self.data);
					const section_zone = section_dragged_over.zone || 'body';

					// Get sections in this zone, sorted by index
					const zone_sections = page_type_sections().filter((s) => (s.zone || 'body') === section_zone).sort((a, b) => a.index - b.index);

					// Find the position of the dragged-over section within this zone
					const section_position_in_zone = zone_sections.findIndex((s) => s.id === section_dragged_over.id);

					const target_position = closestEdgeOfTarget === 'top'
						? section_position_in_zone
						: section_position_in_zone + 1;

					try {
						// Create new section first to avoid visual jumps
						const new_section = PageTypeSections.create({
							page_type: page_type.id,
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

					dragging_over_section = false;
					hovering_over_zone = null;
				}
			});
		}

		let editing_section = false;
		let editing_section_target = void 0;
		let copying_entries = false;
		let source_symbol_id = void 0;
		let destination_section_id = void 0;
		const source_symbol = $.derived(() => source_symbol_id ? SiteSymbols.one(source_symbol_id) : undefined);

		const destination_section = $.derived(() => destination_section_id
			? PageTypeSections.one(destination_section_id)
			: undefined);

		const copy_symbol_entries = $.derived(() => useCopyEntries([source_symbol()]));

		// Establish reactive dependency for copy_symbol_entries worker
		async function copy_symbol_entries_to_section(symbol_id, section_id) {
			source_symbol_id = symbol_id;
			destination_section_id = section_id;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
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
								pb.discard();
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
								class: 'z-[999] w-[calc(100vw_-_1rem)] max-w-none h-[calc(100vh_-_1rem)] flex flex-col p-2 gap-2',
								children: ($$renderer) => {
									SectionEditor($$renderer, {
										component: editing_section_target,
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

			$$renderer.push(` `);

			if (!page_mounted && page_type?.sections.length) {
				$$renderer.push(`<!--[0--><div class="spinner svelte-wiu0gb">`);

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

			if (showing_block_toolbar) {
				$$renderer.push(`<!--[0--><div class="absolute z-50">`);

				BlockToolbar($$renderer, {
					id: hovered_section_id,
					i: hovered_section_zone_position().index,
					is_last: hovered_section_zone_position().is_last,
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

			$$renderer.push(`<!--]--> <main id="#Page" data-test=""${$.attr('lang', $.store_get($$store_subs ??= {}, '$locale', locale))}${$.attr_class('svelte-wiu0gb', void 0, {
				'fadein': page_mounted,
				'dragging': $.store_get($$store_subs ??= {}, '$dragging_symbol', dragging_symbol),
				'resizing-editor': is_resizing
			})}><div class="page-content svelte-wiu0gb"><div class="head-editor-container svelte-wiu0gb"><div class="zone-label svelte-wiu0gb">Head HTML</div> <div class="code-zone head-zone svelte-wiu0gb"${$.attr_style(`height: ${$.stringify(head_editor_height)}px;`)}>`);

			CodeEditor($$renderer, {
				mode: 'html',
				get value() {
					return head;
				},

				set value($$value) {
					head = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div${$.attr_class('resize-handle svelte-wiu0gb', void 0, { 'resizing': is_resizing })}><span class="grab-handle svelte-wiu0gb">`);
			Icon($$renderer, { icon: 'mdi:drag-vertical-variant' });
			$$renderer.push(`<!----></span></div></div> <div class="zones-container svelte-wiu0gb"><div class="zone-label svelte-wiu0gb">Header</div> <section${$.attr_class('page-zone header-zone svelte-wiu0gb', void 0, { 'dragging-over': hovering_over_zone === 'header' })} data-zone="header"><!--[-->`);

			const each_array = $.ensure_array_like(header_sections());

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let section = each_array[$$index];
				const symbol = site_symbols().find((s) => s.id === section.symbol);

				$$renderer.push(`<div role="region"${$.attr('data-section', section.id)}${$.attr('data-symbol', symbol?.id)}${$.attr('id', `section-${$.stringify(section.id)}`)}${$.attr('data-test-id', `page-type-section-${$.stringify(section.id)}`)} style="min-height: 3rem;overflow:hidden;position: relative;" class="svelte-wiu0gb">`);

				if (symbol) {
					$$renderer.push('<!--[0-->');
					ComponentNode($$renderer, { section, block: symbol });
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			}

			$$renderer.push(`<!--]--> `);

			if (header_sections().length === 0) {
				$$renderer.push(`<!--[0--><div class="empty-zone svelte-wiu0gb"><span>Drag blocks here for the header</span></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></section> <div class="zone-label svelte-wiu0gb">Body `);

			if (is_static_page_type()) {
				$$renderer.push(`<!--[0--><span class="zone-mode svelte-wiu0gb">(Static)</span>`);
			} else {
				$$renderer.push(`<!--[-1--><span class="zone-mode svelte-wiu0gb">(Dynamic)</span>`);
			}

			$$renderer.push(`<!--]--></div> <section${$.attr_class('page-zone body-zone svelte-wiu0gb', void 0, { 'dragging-over': hovering_over_zone === 'body' })} data-zone="body"><!--[-->`);

			const each_array_1 = $.ensure_array_like(body_sections());

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let section = each_array_1[$$index_1];
				const symbol = site_symbols().find((s) => s.id === section.symbol);

				$$renderer.push(`<div role="region"${$.attr('data-section', section.id)}${$.attr('data-symbol', symbol?.id)}${$.attr('id', `section-${$.stringify(section.id)}`)}${$.attr('data-test-id', `page-type-section-${$.stringify(section.id)}`)} style="min-height: 3rem;overflow:hidden;position: relative;" class="svelte-wiu0gb">`);

				if (symbol) {
					$$renderer.push('<!--[0-->');
					ComponentNode($$renderer, { section, block: symbol });
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			}

			$$renderer.push(`<!--]--> `);

			if (body_sections().length === 0) {
				$$renderer.push(`<!--[0--><div class="empty-zone main-body svelte-wiu0gb">`);

				if (is_static_page_type()) {
					$$renderer.push(`<!--[0--><span>Drag blocks here for static body content</span>`);
				} else {
					$$renderer.push(`<!--[-1--><span>Drag blocks here for default body content (users can modify)</span>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></section> <div class="zone-label svelte-wiu0gb">Footer</div> <section${$.attr_class('page-zone footer-zone svelte-wiu0gb', void 0, { 'dragging-over': hovering_over_zone === 'footer' })} data-zone="footer"><!--[-->`);

			const each_array_2 = $.ensure_array_like(footer_sections());

			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let section = each_array_2[$$index_2];
				const symbol = site_symbols().find((s) => s.id === section.symbol);

				$$renderer.push(`<div role="region"${$.attr('data-section', section.id)}${$.attr('data-symbol', symbol?.id)}${$.attr('id', `section-${$.stringify(section.id)}`)}${$.attr('data-test-id', `page-type-section-${$.stringify(section.id)}`)} style="min-height: 3rem;overflow:hidden;position: relative;" class="svelte-wiu0gb">`);

				if (symbol) {
					$$renderer.push('<!--[0-->');
					ComponentNode($$renderer, { section, block: symbol });
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			}

			$$renderer.push(`<!--]--> `);

			if (footer_sections().length === 0) {
				$$renderer.push(`<!--[0--><div class="empty-zone svelte-wiu0gb"><span>Drag blocks here for the footer</span></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></section> <div class="zone-label svelte-wiu0gb">Body Footer HTML</div> <section class="code-zone foot-zone svelte-wiu0gb">`);

			CodeEditor($$renderer, {
				mode: 'html',
				get value() {
					return foot;
				},

				set value($$value) {
					foot = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></section></div></div></main>`);
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