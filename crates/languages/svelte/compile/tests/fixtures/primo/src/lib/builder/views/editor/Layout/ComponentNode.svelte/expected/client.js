import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { fade } from 'svelte/transition';
import * as _ from 'lodash-es';
import * as Dialog from '$lib/components/ui/dialog';
import ImageField from '$lib/builder/field-types/ImageField.svelte';
import LinkField from '$lib/builder/field-types/Link.svelte';
import VideoModal from '$lib/builder/views/modal/VideoModal.svelte';
import { tick, createEventDispatcher } from 'svelte';
import { createUniqueID } from '$lib/builder/utils';
import { processCode, compare_urls } from '$lib/builder/utils';
import { locale } from '$lib/builder/stores/app/misc';
import { site_html } from '$lib/builder/stores/app/page';
import RichTextButton from './RichTextButton.svelte';
import ImageOverlay from '$lib/builder/components/ImageEditorOverlay.svelte';
import { watch } from 'runed';
import { component_iframe_srcdoc } from '$lib/builder/components/misc';

import {
	SiteSymbols,
	PageSectionEntries,
	PageTypeSectionEntries,
	Sites,
	SiteUploads,
	LibraryUploads,
	Pages
} from '$lib/pocketbase/collections';

import { self } from '$lib/pocketbase/managers';
import { site_context } from '$lib/builder/stores/context';
import { Editor, Extension } from '@tiptap/core';
import { rich_text_extensions } from '$lib/builder/rich-text/extensions';
import MarkdownCodeMirror from '$lib/builder/components/CodeEditor/MarkdownCodeMirror.svelte';
import { convert_markdown_to_html, convert_rich_text_to_html } from '$lib/builder/utils';
import { useContent } from '$lib/Content.svelte';
import { build_live_page_url } from '$lib/pages';
import * as Avatar from '$lib/components/ui/avatar/index.js';
import { getUserActivity, setUserActivity } from '$lib/UserActivity.svelte';

var root = $.from_html(`<button type="button" class="px-4 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-900 rounded-md">Delete</button>`);
var root_1 = $.from_html(`<form><!> <div class="flex justify-end gap-2 mt-2"><!> <button type="submit" class="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-md">Done</button></div></form>`);
var root_2 = $.from_html(`<form><!> <div class="flex justify-end gap-2 mt-2"><button type="submit" class="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-md">Done</button></div></form>`);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<div class="bg-[var(--color-gray-8)] rounded-bl-lg rounded-br-lg p-2"><!></div>`);
var root_5 = $.from_html(`<div class="pointer-events-none flex justify-center items-start absolute inset-0 ring-inset ring-8 ring-[var(--color-gray-8)]"></div>`);
var root_6 = $.from_html(`<iframe frameborder="0" title="block" class="svelte-qbpdp0"></iframe>`);
var root_7 = $.from_html(`<div class="component-error svelte-qbpdp0"><pre class="svelte-qbpdp0"></pre> <p class="component-error__hint svelte-qbpdp0">Check console for full error.</p></div>`);
var root_8 = $.from_html(`<div class="menu floating-menu svelte-qbpdp0"><!> <!> <!> <!> <!> <!> <!> <!> <!> <!></div>`);
var root_9 = $.from_html(`<div class="menu bubble-menu svelte-qbpdp0"><!> <!> <!> <!> <!></div>`);
var root_10 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function ComponentNode($$anchor, $$props) {
	$.push($$props, true);

	const $locale = () => $.store_get(locale, '$locale', $$stores);
	const $site_html = () => $.store_get(site_html, '$site_html', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { value: site } = site_context.getOr({ value: null });
	const dispatch = createEventDispatcher();
	let node = $.state(void 0);
	const fields = $.derived(() => $$props.block.fields());

	const entries = $.derived(() => 'page_type' in $$props.section
		? $$props.section.entries()
		: 'page' in $$props.section ? $$props.section.entries() : undefined);

	const data = $.derived(() => useContent($$props.section, { target: 'cms' }));
	const component_data = $.derived(() => $.get(data) && ($.get(data)[$locale()] ?? {}));
	const zone = $.derived(() => 'zone' in $$props.section ? $$props.section.zone : 'body');

	const related_activities = $.derived(() => getUserActivity({
		filter: (activity) => activity.site_symbol?.id === $$props.block.id || activity.page_type_section?.id === $$props.section.id || activity.page_section?.id === $$props.section.id
	}));

	let bubble_menu_state = $.state($.proxy({ visible: false, top: 0, left: 0 }));
	let floating_menu_state = $.state($.proxy({ visible: false, top: 0, left: 0 }));
	let image_overlay_is_visible = $.state(false);
	let image_editor_element = $.state(null);

	async function attach_image_overlay(element, id = null) {
		$.set(image_editor_element, element, true);
		$.set(image_overlay_is_visible, true);

		$.set(
			current_image_id,
			id, // Store the ID for later use
			true
		);
	}

	let editing_markdown = $.state(false);
	let current_markdown_entry_id = $.state(void 0);
	let current_markdown_value = $.state(void 0);
	const markdown_elements = new Map();
	let active_editor = $.state(void 0);
	let formatting_state = $.state($.proxy({ bold: false, italic: false, highlight: false, strike: false }));

	// Store editor instances by rich-text ID so we can access them later
	let rich_text_editors = new Map();

	const rich_text_classes = {};

	// Keep markdown locked when blur is caused by clicking editor UI buttons
	// so that we don't hydrate the section while it's being edited (and lose focus)
	let suppress_blur_unlock = $.state(false);

	let suppress_timer;

	// Event listener cleanup
	let event_listeners = new Map();

	let window_message_handler = null;
	let doc_event_listeners = new Map();
	let error = $.state('');
	let generated_js = $.state('');

	async function generate_component_code(block) {
		const safeData = $.get(component_data) && typeof $.get(component_data) === 'object' ? $.get(component_data) : {};

		const res = await processCode({
			component: {
				head: '',
				html: block.html,
				css: block.css,
				js: block.js,
				data: safeData
			},
			buildStatic: false,
			runtime: ['mount', 'unmount']
		});

		if (res.error) {
			$.set(error, res.error, true);
			dispatch_mount();
		} else {
			$.set(error, '');
			$.set(generated_js, res.js, true);
		}
	}

	let is_editing = $.state(false);
	let field_save_timeout;

	function update_formatting_state() {
		if ($.get(active_editor)) {
			$.set(
				formatting_state,
				{
					bold: $.get(active_editor).isActive('bold'),
					italic: $.get(active_editor).isActive('italic'),
					highlight: $.get(active_editor).isActive('highlight'),
					strike: $.get(active_editor).isActive('strike')
				},
				true
			);
		}
	}

	// Helper function to clean up event listeners
	function cleanup_event_listeners() {
		// Clean up all stored event listeners
		event_listeners.forEach((cleanup) => cleanup());

		event_listeners.clear();

		// Clean up doc event listeners
		doc_event_listeners.forEach((cleanup) => cleanup());

		doc_event_listeners.clear();
	}

	async function make_content_editable() {
		if (!$.get(node)?.contentDocument || !$.get(entries) || !$.get(fields)) return;

		// Wait for content to load, then get valid elements
		const valid_elements = await (async () => {
			const doc = $.get(node).contentDocument;
			const component = doc.querySelector('#component');

			// Poll every 200ms for up to 10 seconds
			for (let i = 0; i < 50; i++) {
				await new Promise((resolve) => setTimeout(resolve, 200));

				// Check if component container has content
				if (component && component.children.length > 0) {
					// Now get the actual editable elements
					const elements = Array.from(doc.querySelectorAll('img, a, p, span, h1, h2, h3, h4, h5, h6, div'));

					return elements.filter((el) => el.tagName === 'IMG' || !!el.textContent?.trim());
				}
			}

			// Return empty array if no content found after timeout
			return [];
		})();

		// Clean up previous event listeners before adding new ones
		cleanup_event_listeners();

		// loop over component_data and match to elements
		const assigned_entry_ids = new Set(); // elements that have been matched to a field ID

		const matched_elements = new Set(); // track which elements have been matched
		const static_field_types = ['text', 'link', 'image', 'markdown', 'rich-text'];
		const static_fields = $.get(fields).filter((f) => static_field_types.includes(f.type)) ?? [];

		for (const field of static_fields) {
			// Check if all elements are already matched
			if (matched_elements.size === valid_elements.length) break;

			// The on-page matcher binds each entry to the next data-key element positionally,
			// so entries must be consumed in render order. A repeater subfield's own index is
			// always 0; its render position comes from its ancestor row-items' indices. Build the
			// full root→leaf index path for each entry and sort lexicographically by it, so leaves
			// under different (and nested) rows can't collide. Without this, subfields mis-bind to
			// the wrong row after a reorder or CLI re-import (storage order != index order).
			const entry_by_id = new Map($.get(entries).map((e) => [e.id, e]));

			const render_path = (e) => {
				const path = [];
				const seen = new Set();

				for (let cur = e; cur && !seen.has(cur.id); cur = cur.parent ? entry_by_id.get(cur.parent) : undefined) {
					seen.add(cur.id);
					path.unshift(cur.index);
				}

				return path;
			};

			const compare_paths = (a, b) => {
				for (let i = 0; i < Math.min(a.length, b.length); i++) {
					if (a[i] !== b[i]) return a[i] - b[i];
				}

				return a.length - b.length;
			};

			const path_by_id = new Map($.get(entries).map((e) => [e.id, render_path(e)]));
			const relevant_entries = $.get(entries).filter((e) => e.field === field.id).sort((a, b) => compare_paths(path_by_id.get(a.id), path_by_id.get(b.id)));

			for (const entry of relevant_entries) {
				search_elements_for_value({
					id: entry.id,
					key: field.key,
					value: entry.value,
					type: field.type
				});
			}
		}

		// open any other links in a new tab
		reroute_links();

		function search_elements_for_value({ id, key, value, type }) {
			for (const element of valid_elements) {
				if (matched_elements.has(element)) continue; // element is already matched, skip

				const matched = match_value_to_element({ id, key, value, type, element });

				if (matched) {
					assigned_entry_ids.add(id);
					matched_elements.add(element);

					break;
				}
			}
		}

		function match_value_to_element({ id, element, key, value, type }) {
			// ignore element (user override)
			if (element.dataset.key === '') {
				return false;
			}

			// skip empty element
			if (type !== 'image' && !element.textContent.trim()) return false;

			// Match by explicitly set key
			const key_matches = element.dataset.key === key;

			if (key_matches) {
				if (type === 'rich-text') {
					set_editable_rich_text({ element, id, value });
				} else if (type === 'markdown') {
					set_editable_markdown({ element, id, value });
				} else if (type === 'image') {
					set_editable_image({ element, id });
				} else if (type === 'link') {
					set_editable_link({ element, id, url: value.url });
				} else {
					set_editable_text({ element, id });
				}

				return true;
			}

			// Match by inferring key by type
			if (type === 'link' && element.nodeName === 'A') {
				const external_url_matches = value.url?.replace(/\/$/, '') === element.href?.replace(/\/$/, '');
				const internal_url_matches = window.location.origin + value.url?.replace(/\/$/, '') === element.href?.replace(/\/$/, '');
				const link_matches = (external_url_matches || internal_url_matches) && value.label === element.innerText;

				if (link_matches) {
					set_editable_link({ element, id, url: value.url });

					return true;
				}
			} else if (type === 'image' && element.nodeName === 'IMG') {
				const image_matches = compare_urls(value.url, element.src);

				if (image_matches) {
					set_editable_image({ element, id });

					return true;
				}
			} else if (type === 'rich-text' && element.nodeName === 'DIV') {
				const existing_html = element.innerHTML.trim().replace(/<!---->/g, ''); // remove svelte hydration markers
				const candidate_html = convert_rich_text_to_html(value);

				if (existing_html === candidate_html) {
					set_editable_rich_text({ element, id, value });

					return true;
				}
			} else if (type === 'markdown' && element.nodeName === 'DIV') {
				const existing_html = element.innerHTML.replace(/<!---->/g, '').trim(); // remove svelte hydration markers
				const candidate_html = convert_markdown_to_html(value).trim();

				if (existing_html === candidate_html) {
					set_editable_markdown({ id, element, value });

					return true;
				}
			} else if (type === 'text') {
				const text = element.innerText?.trim();
				const text_matches = typeof value == 'string' && value.trim() === text;

				// All other field types are text
				if (text_matches && text.length > 0) {
					set_editable_text({ id, element });

					return true;
				} else return false;
			}
		}

		async function set_editable_rich_text({ id, element, value }) {
			element.innerHTML = '';
			element.setAttribute('data-entry', id);

			// move element classes to tiptap div to maintain styling
			const rich_text_id = element.getAttribute('data-rich-text-id') || createUniqueID();

			let saved_rich_text_classes = rich_text_classes[rich_text_id];

			if (!saved_rich_text_classes) {
				rich_text_classes[rich_text_id] = element.className;
				saved_rich_text_classes = rich_text_classes[rich_text_id];
				element.classList.remove(...element.classList);
				element.setAttribute('data-rich-text-id', rich_text_id); // necessary since data attribute gets cleared when hydrating (i.e. editing from fields)
			}

			const editor = new Editor({
				content: value,
				element,
				extensions: [
					...rich_text_extensions,
					Extension.create({
						onFocus() {
							$.set(is_editing, true);
							$.set(active_editor, editor, true);
							update_formatting_state();
						},

						onSelectionUpdate() {
							update_formatting_state();

							// Update menu positions when selection changes
							update_menu_positions();
						},

						onBlur: async () => {
							// Only unlock when blur wasn't caused by clicking editor UI
							if (!$.get(suppress_blur_unlock)) {
								$.set(is_editing, false);
							}

							clearTimeout(field_save_timeout);

							setTimeout(
								() => {
									// Hide floating menu on blur, timeout so click registers first
									hide_menus();
								},
								100
							);
						},

						onUpdate: async ({ editor }) => {
							// Debounce saves to avoid constant re-renders while editing
							clearTimeout(field_save_timeout);

							field_save_timeout = setTimeout(
								async () => {
									const json = editor.getJSON();

									save_edited_value({ id, value: json });
								},
								200
							);
						}
					})
				],
				editorProps: {
					attributes: {
						class: saved_rich_text_classes,
						'data-rich-text-id': rich_text_id
					},
					handleDOMEvents: {
						click: (view, event) => {
							const target = event.target;

							if (target.tagName === 'A') {
								// Get the position of the clicked link
								const pos = view.posAtDOM(target, 0);

								const resolved = view.state.doc.resolve(pos);
								const linkMark = resolved.marks().find((mark) => mark.type.name === 'link');

								if (linkMark) {
									// Extract link data
									const href = linkMark.attrs.href || '';

									const text = target.textContent || '';

									$.set(current_link_value, { url: href, label: text, active: true }, true);
									$.set(current_link_position, { from: pos, to: pos + text.length }, true);
									$.set(current_link_entry_id, null // No entry for TipTap links
									);
									$.set(current_link_element, target, true);
									$.set(editing_existing_link, true);
									$.set(editing_link, true);

									return true;
								}
							}

							return false;
						},

						mouseover: (view, event) => {
							const target = event.target;

							if (target.tagName === 'IMG') {
								const src = target.getAttribute('src') || '';
								const alt = target.getAttribute('alt') || '';

								// Get the position of the hovered image
								const pos = view.posAtDOM(target, 0);

								const node = view.state.doc.nodeAt(pos);

								$.set(current_image_value, { url: src, alt }, true);
								$.set(current_image_element, target, true);
								$.set(current_image_position, { from: pos, to: pos + (node?.nodeSize || 0) }, true);
								$.set(current_image_id, null // No entry for TipTap images
								);

								// Show the overlay for TipTap images
								attach_image_overlay(target, null);

								return true;
							}

							return false;
						}
					}
				}
			});

			// Store the editor instance for later access
			rich_text_editors.set(rich_text_id, editor);
		}

		function set_editable_markdown({ id, element, value }) {
			element.setAttribute('data-entry', id);
			element.style.cursor = 'text';
			markdown_elements.set(id, element);

			const click_handler = (event) => {
				const entry = $.get(entries // get updated value (bc formatting differences register as updates)
				)?.find((e) => e.id === id);

				event.preventDefault();
				event.stopPropagation();
				$.set(current_markdown_entry_id, id, true);
				$.set(current_markdown_value, entry?.value || value, true);
				$.set(editing_markdown, true);
			};

			element.addEventListener('click', click_handler, { capture: true });

			// prevent links within markdown content from navigating
			element.querySelectorAll('a').forEach((a) => {
				a.addEventListener('click', (e) => {
					e.preventDefault();
				});
			});

			// Store cleanup function
			event_listeners.set(`markdown-${id}`, () => {
				element.removeEventListener('click', click_handler, { capture: true });
			});
		}

		async function set_editable_image({ id, element }) {
			element.setAttribute(`data-entry`, id);

			element.onmousemove = () => {
				attach_image_overlay(element, id);
			};
		}

		async function set_editable_link({ element, id, url }) {
			element.style.outline = '0';
			element.setAttribute(`data-entry`, id);
			element.contentEditable = true;

			const click_handler = (e) => {
				e.preventDefault();
				e.stopPropagation();
				$.set(current_link_element, element, true);
				$.set(current_link_entry_id, id, true);

				// Set current_link_value from the entry
				const entry = $.get(entries)?.find((entry) => entry.id === id);

				$.set(
					current_link_value,
					entry?.value || {
						url: element.href || '',
						label: element.innerText || '',
						active: true
					},
					true
				);

				hide_menus();
				$.set(editing_link, true);
			};

			element.addEventListener('click', click_handler, { capture: true });

			// Store cleanup function
			event_listeners.set(`link-${id}`, () => {
				element.removeEventListener('click', click_handler, { capture: true });
			});
		}

		async function set_editable_text({ id, element }) {
			element.style.outline = '0';
			element.setAttribute(`data-entry`, id);

			const keydown_handler = (e) => {
				if (e.code === 'Enter') {
					e.preventDefault();

					const target = e.target;

					if (target) target.blur();
				}
			};

			const input_handler = (e) => {
				// Debounce saves to avoid constant re-renders while editing
				clearTimeout(field_save_timeout);

				field_save_timeout = setTimeout(
					() => {
						const target = e.target;

						if (target) save_edited_value({ id, value: target.innerText });
					},
					200
				);
			};

			const blur_handler = (e) => {
				$.set(is_editing, false);

				// Final save on blur
				clearTimeout(field_save_timeout);

				const target = e.target;

				if (target) save_edited_value({ id, value: target.innerText });
			};

			const focus_handler = () => {
				$.set(is_editing, true);
			};

			element.addEventListener('keydown', keydown_handler);
			element.addEventListener('input', input_handler);
			element.addEventListener('blur', blur_handler);
			element.addEventListener('focus', focus_handler);
			element.contentEditable = true;

			// Store cleanup function
			event_listeners.set(`text-${id}`, () => {
				element.removeEventListener('keydown', keydown_handler);
				element.removeEventListener('input', input_handler);
				element.removeEventListener('blur', blur_handler);
				element.removeEventListener('focus', focus_handler);
			});
		}
	}

	function handle_markdown_save() {
		const value = $.get(current_markdown_value);

		save_edited_value({ id: $.get(current_markdown_entry_id), value });

		const target = markdown_elements.get($.get(current_markdown_entry_id));

		target.innerHTML = convert_markdown_to_html(value);
		$.set(editing_markdown, false);
	}

	async function save_edited_value({ id, value }) {
		// Find the entry by ID
		const entry = $.get(entries)?.find((entry) => entry.id === id);

		if (!entry) {
			console.error('Entry not found for ID:', id);

			return;
		}

		// Update the entry based on section type
		if ('page_type' in $$props.section) {
			PageTypeSectionEntries.update(entry.id, { value });
		} else if ('page' in $$props.section) {
			PageSectionEntries.update(entry.id, { value });
		}

		// Commit changes with a delay to batch multiple edits
		clearTimeout(commit_task);

		commit_task = setTimeout(() => self.commit(), 500);
	}

	let commit_task;
	let mounted = false;

	function dispatch_mount() {
		if (!mounted) {
			dispatch('mount');
			mounted = true;
		}
	}

	// Reroute non-entry links to open in a new tab
	async function reroute_links() {
		if (!$.get(node)?.contentDocument) return;

		$.get(node).contentDocument.querySelectorAll('a:not([data-entry] a):not([data-key] a):not([data-entry]):not([data-key])').forEach((link) => {
			link.addEventListener('click', (e) => {
				e.preventDefault();
				window.open(link.href, '_blank');
			});
		});
	}

	function on_page_scroll() {
		$.set(image_overlay_is_visible, false);
		update_menu_positions();
	}

	let mutation_observer;
	let iframe_resize_observer;

	onMount(() => {
		mutation_observer = new MutationObserver(() => {
			dispatch_mount();
		});

		// Resize component iframe wrapper on resize to match content height (message set from `setup_component_iframe`)
		window_message_handler = (event) => {
			if (!$.get(node) || event.source !== $.get(node).contentWindow) return;

			const message = event.data;

			if (!message) return;

			if (message.type === 'component-error') {
				const incoming_error = typeof message.error === 'string'
					? message.error
					: message.error?.toString?.() ?? 'Unknown error';

				$.set(error, incoming_error, true);
				dispatch_mount();
			}
		};

		window.addEventListener('message', window_message_handler);
		document.querySelector('#Page')?.addEventListener('scroll', on_page_scroll);

		return () => {
			mutation_observer?.disconnect();
			iframe_resize_observer?.disconnect();

			// Clean up window message listener
			if (window_message_handler) {
				window.removeEventListener('message', window_message_handler);
				window_message_handler = null;
			}

			// Clean up all event listeners
			cleanup_event_listeners();

			// Clear timeouts
			if (field_save_timeout) clearTimeout(field_save_timeout);

			if (commit_task) clearTimeout(commit_task);
			if (suppress_timer) clearTimeout(suppress_timer);

			document.querySelector('#Page')?.removeEventListener('scroll', on_page_scroll);
		};
	});

	function update_menu_positions() {
		if (!$.get(node)?.contentDocument) return;

		if ($.get(editing_link) || $.get(editing_image) || $.get(editing_video)) {
			hide_menus();

			return;
		}

		// Get selection from the iframe document, not the main document
		const iframeDoc = $.get(node).contentDocument;

		const selection = iframeDoc?.getSelection();

		if (!selection || selection.rangeCount === 0) {
			hide_menus();

			return;
		}

		update_bubble_menu(selection);
		update_floating_menu(selection);
	}

	function update_bubble_menu(selection) {
		const has_selection = selection.toString().length > 0;

		if (!has_selection) {
			$.get(bubble_menu_state).visible = false;

			return;
		}

		const range = selection.getRangeAt(0);
		const common_ancestor = range.commonAncestorContainer;
		const element = common_ancestor.nodeName === '#text' ? common_ancestor.parentElement : common_ancestor;
		const rich_text_container = element?.closest('[data-rich-text-id]');

		if (rich_text_container) {
			const iframe_rect = $.get(node).getBoundingClientRect();
			const rect = range.getBoundingClientRect();

			$.set(
				bubble_menu_state,
				{
					visible: true,
					left: rect.left + iframe_rect.left,
					top: rect.bottom + iframe_rect.top + 10
				},
				true
			);
		} else {
			$.get(bubble_menu_state).visible = false;
		}
	}

	function update_floating_menu(selection) {
		const range = selection.getRangeAt(0);
		const startNode = range.startContainer;
		const blockElement = startNode.nodeName === '#text' ? startNode.parentElement : startNode;
		const is_in_rich_text = blockElement.closest('[data-rich-text-id]');
		const is_top_level_block = blockElement.parentElement.matches('.ProseMirror');
		const is_empty_paragraph = blockElement.textContent === '';
		const is_at_start = range.startOffset === 0;

		if (is_in_rich_text && is_top_level_block && is_empty_paragraph && is_at_start) {
			const iframe_rect = $.get(node).getBoundingClientRect();
			const rect = blockElement.getBoundingClientRect();

			$.set(
				floating_menu_state,
				{
					visible: true,
					left: rect.left + iframe_rect.left + 10,
					top: rect.top + iframe_rect.top + 7
				},
				true
			);
		} else {
			$.get(floating_menu_state).visible = false;
		}
	}

	function hide_menus() {
		$.get(bubble_menu_state).visible = false;
		$.get(floating_menu_state).visible = false;
	}

	let setup_complete = $.state(false);

	function setup_component_iframe() {
		$.set(setup_complete, false);

		// Clear previous editor instances
		rich_text_editors.clear();

		// Wait for iframe to be ready
		$.get(node).removeEventListener('load', setup);

		if ($.get(node).contentDocument.readyState === 'complete') {
			setup();
		} else {
			$.get(node).addEventListener('load', setup);
		}

		function setup() {
			const doc = $.get(node).contentDocument;

			if (!doc) return;

			// Clean up previous doc event listeners
			doc_event_listeners.forEach((cleanup) => cleanup());

			doc_event_listeners.clear();
			doc.body.addEventListener('scroll', on_page_scroll);

			// Store cleanup function for doc scroll listener
			doc_event_listeners.set('scroll', () => {
				doc.body.removeEventListener('scroll', on_page_scroll);
			});

			// Disconnect previous observer if it exists
			iframe_resize_observer?.disconnect();

			const update_height = () => {
				const height = doc.body.clientHeight;

				if ($.get(node)) {
					$.get(node).style.height = height + 'px';
				}

				dispatch('resize');
			};

			iframe_resize_observer = new ResizeObserver(update_height);
			iframe_resize_observer.observe(doc.body);

			// Add mutation observer for DOM changes
			mutation_observer.observe(doc.body, {
				childList: true,
				subtree: true,
				attributes: true,
				characterData: true
			});

			$.set(setup_complete, true);

			// Every time setup is completed, we send the component to the IFrame.
			// This happens also when the ComponentNode is moved in DOM due to IFrame resetting.
			if ($.get(component_data) && $.get(generated_js)) {
				$.set(last_sent_data, _.cloneDeep($.get(component_data)), true);
				send_component_to_iframe($.get(generated_js), $.get(component_data));
			}
		}
	}

	let last_code_signature = $.state('');

	// Watch for changes in raw block code or component data and regenerate compiled code
	watch(
		() => ({
			html: $$props.block.html,
			css: $$props.block.css,
			js: $$props.block.js,
			data: $.get(component_data),
			error: $.get(error)
		}),
		({ html, css, js, data, error }) => {
			// Wait until content data has resolved (avoid compiling with undefined data)
			if (data === undefined) return;

			// Recompile when any source (html/css/js) changes or an error exists.
			const updated_code_signature = `${html}\n/*__CSS__*/\n${css}\n/*__JS__*/\n${js}`;

			if ($.get(last_code_signature) !== updated_code_signature || error) {
				generate_component_code($$props.block);
				$.set(last_code_signature, updated_code_signature);
			}
		}
	);

	// Watch for compiled code changes and send to iframe when ready
	// Only send when this component's code & data meaningfully changed to avoid
	// triggering re-renders of unrelated symbols.
	let last_sent_data = $.state(void 0);

	let last_sent_js = $.state('');

	watch(
		() => ({
			updated_js: $.get(generated_js),
			updated_data: $.get(component_data),
			ready: $.get(setup_complete) && !$.get(is_editing)
		}),
		({ updated_js, updated_data, ready }) => {
			if (!(ready && updated_data && updated_js)) return;

			// Skip if updated_data is deeply equal to the last sent value
			if (_.isEqual($.get(last_sent_data), updated_data) && $.get(last_sent_js) === updated_js) return;

			// Store a snapshot to avoid mutation side-effects
			$.set(last_sent_data, _.cloneDeep(updated_data), true);

			$.set(last_sent_js, updated_js, true);
			send_component_to_iframe(updated_js, updated_data);
		}
	);

	async function send_component_to_iframe(js, data) {
		try {
			$.get(node).contentWindow.postMessage({ type: 'component', payload: { js, data } }, '*');
			make_content_editable();
		} catch(e) {
			console.error(e);
			$.set(error, e, true);
			dispatch_mount();
		}
	}

	let editing_video = $.state(false);
	let editing_image = $.state(false);
	let current_image_element = $.state(null);
	let current_image_id = $.state(null);
	let current_image_value = $.state($.proxy({ url: '', alt: '' }));
	let editing_link = $.state(false);
	let current_link_element = $.state(null);
	let current_link_entry_id = $.state(null);
	let current_link_value = $.state($.proxy({ url: '', label: '', active: true }));
	let current_link_page = $.derived(() => $.get(current_link_value).page ? Pages.one($.get(current_link_value).page) : null);

	let current_link_url = $.derived(() => $.get(current_link_page)
		? build_live_page_url($.get(current_link_page))?.pathname
		: $.get(current_link_value).url);

	// TipTap image and link position tracking (like RichText)
	let current_image_position = $.state(null);

	let current_link_position = $.state(null);
	let editing_existing_link = $.state(false);
	const editing = $.derived(() => $.get(is_editing) || $.get(editing_video) || $.get(editing_image) || $.get(editing_existing_link) || $.get(editing_link) || $.get(editing_markdown));

	if ('page_type' in $$props.section) {
		$.user_effect(() => setUserActivity($.get(editing) ? { page_type_section: $$props.section.id } : {}));
	} else if ('page' in $$props.section) {
		$.user_effect(() => setUserActivity($.get(editing) ? { page_section: $$props.section.id } : {}));
	}

	var fragment = root_10();
	var node_1 = $.first_child(fragment);

	$.component(node_1, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			get open() {
				return $.get(editing_image);
			},

			set open($$value) {
				$.set(editing_image, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_2 = $.first_child(fragment_1);

				$.component(node_2, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'z-[999] sm:max-w-[500px] pt-12',
						children: ($$anchor, $$slotProps) => {
							const field = $.derived(() => $.get(fields)?.find((f) => $.get(entries)?.find((e) => e.id === $.get(current_image_id))?.field === f.id) || {
								id: '',
								label: 'Image',
								key: 'image',
								type: 'image',
								config: {},
								index: 0
							});

							const entry = $.derived(() => ({
								id: $.get(current_image_id) || '',
								locale: 'en',
								field: $.get(field).id,
								index: 0,
								value: $.get(current_image_value)
							}));

							var form = root_1();
							var node_3 = $.child(form);

							ImageField(node_3, {
								get field() {
									return $.get(field);
								},

								get entry() {
									return $.get(entry);
								},

								onchange: async (changeData) => {
									// Extract the actual value from the nested structure
									const fieldKey = Object.keys(changeData)[0];

									const newValue = changeData[fieldKey][0].value;

									// If there's a new upload, populate the URL field with the upload URL
									// This handles both new uploads and replacements
									if (newValue.upload) {
										const upload = site
											? SiteUploads.one(newValue.upload)
											: LibraryUploads.one(newValue.upload);

										if (upload) {
											// If file is not yet saved to server, commit first
											if (typeof upload.file !== 'string') {
												try {
													await self.commit();

													if (typeof upload.file === 'string') {
														const baseURL = self.instance?.baseURL;
														const collection = site ? 'site_uploads' : 'library_uploads';

														newValue.url = `${baseURL}/api/files/${collection}/${upload.id}/${upload.file}`;
													}
												} catch(error) {
													console.error('Failed to commit upload in onchange:', error);
												}
											} else {
												const baseURL = self.instance?.baseURL;
												const collection = site ? 'site_uploads' : 'library_uploads';

												newValue.url = `${baseURL}/api/files/${collection}/${upload.id}/${upload.file}`;
											}
										}
									}

									$.set(current_image_value, newValue, true);
								}
							});

							var div = $.sibling(node_3, 2);
							var node_4 = $.child(div);

							{
								var consequent = ($$anchor) => {
									var button = root();

									$.delegated('click', button, () => {
										// Delete the image from TipTap rich-text only (not for image fields)
										const rich_text_container = $.get(current_image_element).closest('[data-rich-text-id]');

										if (rich_text_container) {
											const rich_text_id = rich_text_container.getAttribute('data-rich-text-id');
											const editor = rich_text_editors.get(rich_text_id);

											// Find and delete the image node
											let image_position = null;

											editor.view.state.doc.descendants((node, position) => {
												if (node.type.name === 'image' && node.attrs.src === $.get(current_image_element).src) {
													image_position = position;

													return false;
												}
											});

											if (image_position !== null) {
												editor.chain().focus().setNodeSelection(image_position).deleteSelection().run();
											}
										}

										$.set(editing_image, false);
									});

									$.append($$anchor, button);
								};

								$.if(node_4, ($$render) => {
									if ($.get(current_image_element) && !$.get(current_image_id)) $$render(consequent);
								});
							}

							$.next(2);
							$.reset(div);
							$.reset(form);

							$.event('submit', form, async (e) => {
								e.preventDefault();

								// Handle submit - same logic as Done button
								if ($.get(current_image_position) && $.get(active_editor)) {
									// Handle TipTap image editing with position tracking (like RichText)
									const { from, to } = $.get(current_image_position);

									// Get the image URL - either from direct URL or from upload
									let imageUrl = $.get(current_image_value).url;

									if (!imageUrl && $.get(current_image_value).upload) {
										// Get upload URL from the upload record
										const upload = site
											? SiteUploads.one($.get(current_image_value).upload)
											: LibraryUploads.one($.get(current_image_value).upload);

										if (upload) {
											const baseURL = self.instance?.baseURL;
											const collection = site ? 'site_uploads' : 'library_uploads';

											// Only use the PocketBase URL if the file is saved server-side (string)
											// If it's still a File object, we need to commit it first
											if (typeof upload.file === 'string') {
												imageUrl = `${baseURL}/api/files/${collection}/${upload.id}/${upload.file}`;
											} else {
												try {
													// Force commit the upload to save it server-side
													await self.commit();

													// Refresh the upload record to get the server-side filename
													const refreshedUpload = site
														? await self.instance?.collection('site_uploads').getOne($.get(current_image_value).upload)
														: await self.instance?.collection('library_uploads').getOne($.get(current_image_value).upload);

													if (refreshedUpload && typeof refreshedUpload.file === 'string') {
														imageUrl = `${baseURL}/api/files/${collection}/${refreshedUpload.id}/${refreshedUpload.file}`;
													} else {
														console.error('Upload still not committed after self.commit()');
														alert('Upload failed to complete. Please try again.');
														$.set(editing_image, false);

														return;
													}
												} catch(error) {
													console.error('Failed to commit upload:', error);
													alert('Failed to save image. Please try again.');
													$.set(editing_image, false);

													return;
												}
											}
										}
									}

									// Replace the image at the tracked position
									$.get(active_editor).chain().setTextSelection({ from, to }).deleteSelection().insertContent({
										type: 'image',
										attrs: {
											src: imageUrl,
											alt: $.get(current_image_value).alt,
											'data-id': createUniqueID()
										}
									}).run();
								} else if (!$.get(current_image_element) && $.get(active_editor)) {
									// Handle TipTap editor images - only for NEW images from floating menu
									// Get the image URL - either from direct URL or from upload
									let imageUrl = $.get(current_image_value).url;

									if (!imageUrl && $.get(current_image_value).upload) {
										// Get upload URL from the upload record
										const upload = site
											? SiteUploads.one($.get(current_image_value).upload)
											: LibraryUploads.one($.get(current_image_value).upload);

										if (upload) {
											const baseURL = self.instance?.baseURL;
											const collection = site ? 'site_uploads' : 'library_uploads';

											// Only use the PocketBase URL if the file is saved server-side (string)
											// If it's still a File object, we need to commit it first
											if (typeof upload.file === 'string') {
												imageUrl = `${baseURL}/api/files/${collection}/${upload.id}/${upload.file}`;
											} else {
												try {
													// Force commit the upload to save it server-side
													await self.commit();

													// Refresh the upload record to get the server-side filename
													const refreshedUpload = site
														? await self.instance?.collection('site_uploads').getOne($.get(current_image_value).upload)
														: await self.instance?.collection('library_uploads').getOne($.get(current_image_value).upload);

													if (refreshedUpload && typeof refreshedUpload.file === 'string') {
														imageUrl = `${baseURL}/api/files/${collection}/${refreshedUpload.id}/${refreshedUpload.file}`;
													} else {
														console.error('Upload still not committed after self.commit()');
														alert('Upload failed to complete. Please try again.');
														$.set(editing_image, false);

														return;
													}
												} catch(error) {
													console.error('Failed to commit upload:', error);
													alert('Failed to save image. Please try again.');
													$.set(editing_image, false);

													return;
												}
											}
										}
									}

									// Just insert the image and let TipTap's onUpdate handle the save automatically
									$.get(active_editor).chain().focus().setImage({ src: imageUrl, alt: $.get(current_image_value).alt }).run();
								} else if ($.get(current_image_element) && !$.get(current_image_id)) {
									// Handle existing TipTap rich-text images (no entry)
									let imageUrl = '';

									if ($.get(current_image_value).url) {
										// Use direct URL if no upload
										imageUrl = $.get(current_image_value).url;
									}

									const rich_text_container = $.get(current_image_element).closest('[data-rich-text-id]');

									if (rich_text_container) {
										const rich_text_id = rich_text_container.getAttribute('data-rich-text-id');
										const editor = rich_text_editors.get(rich_text_id);

										if (editor && editor.view) {
											// Find the image node in the document and select it, then update
											let image_position = null;

											editor.view.state.doc.descendants((node, position) => {
												if (node.type.name === 'image' && node.attrs.src === $.get(current_image_element).src) {
													image_position = position;

													return false; // Stop searching
												}
											});

											if (image_position !== null) {
												// Select the image node and update its attributes
												const result = editor.chain().focus().setNodeSelection(image_position).updateAttributes('image', { src: imageUrl, alt: $.get(current_image_value).alt }).run();

												// The editor's onUpdate callback should handle the save automatically
												// but let's trigger it manually to be sure
												setTimeout(
													() => {
														const json = editor.getJSON();

														save_edited_value({ id: rich_text_id, value: json });
													},
													100
												);
											} else {
												$.get(current_image_element).src = $.get(current_image_value).url;
												$.get(current_image_element).alt = $.get(current_image_value).alt;
											}
										} else {
											// Fallback: directly update the DOM element
											$.get(current_image_element).src = $.get(current_image_value).url;

											$.get(current_image_element).alt = $.get(current_image_value).alt;
										}
									}
								} else if ($.get(current_image_element) && $.get(current_image_id)) {
									// Handle direct image editing (entry-based)
									$.get(current_image_element).src = $.get(current_image_value).url;

									$.get(current_image_element).alt = $.get(current_image_value).alt;

									save_edited_value({
										id: $.get(current_image_id),
										// Only save either the upload ID, or custom URL
										value: $.get(current_image_value).upload
											? { ...$.get(current_image_value), url: undefined }
											: { ...$.get(current_image_value), upload: undefined }
									});
								}

								$.set(editing_image, false);
								$.set(current_image_position, null);
							});

							$.append($$anchor, form);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_5 = $.sibling(node_1, 2);

	$.component(node_5, () => Dialog.Root, ($$anchor, Dialog_Root_1) => {
		Dialog_Root_1($$anchor, {
			get open() {
				return $.get(editing_link);
			},

			set open($$value) {
				$.set(editing_link, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_2 = $.comment();
				var node_6 = $.first_child(fragment_2);

				$.component(node_6, () => Dialog.Content, ($$anchor, Dialog_Content_1) => {
					Dialog_Content_1($$anchor, {
						class: 'z-[999] sm:max-w-[500px] pt-12 overflow-visible',
						children: ($$anchor, $$slotProps) => {
							const field = $.derived(() => $.get(fields)?.find((f) => $.get(entries)?.find((e) => e.id === $.get(current_link_entry_id))?.field === f.id) || {
								id: '',
								label: 'Link',
								key: 'link',
								type: 'link',
								config: {},
								index: 0
							});

							const entry = $.derived(() => ({
								id: $.get(current_link_entry_id) || '',
								locale: 'en',
								field: $.get(field).id,
								index: 0,
								value: $.get(current_link_value) || { url: '', label: '', active: true }
							}));

							var form_1 = root_2();
							var node_7 = $.child(form_1);

							LinkField(node_7, {
								get field() {
									return $.get(field);
								},

								get entry() {
									return $.get(entry);
								},

								onchange: (changeData) => {
									// Extract the actual value from the nested structure
									const fieldKey = Object.keys(changeData)[0];

									const newValue = changeData[fieldKey][0].value;

									$.set(current_link_value, newValue, true);
								}
							});

							$.next(2);
							$.reset(form_1);

							$.event('submit', form_1, (e) => {
								e.preventDefault();

								// Handle submit - same logic as Done button
								if ($.get(current_link_position) && $.get(active_editor) && $.get(editing_existing_link)) {
									// Handle TipTap link editing with position tracking (like RichText)
									const { from, to } = $.get(current_link_position);

									$.get(active_editor).chain().setTextSelection({ from, to }).deleteSelection().insertContent({
										type: 'text',
										text: $.get(current_link_value).label,
										marks: [{ type: 'link', attrs: { href: $.get(current_link_url) } }]
									}).run();
								} else if ($.get(active_editor) && $.get(current_link_value).originalLabel !== undefined) {
									// Handle new TipTap links created from bubble menu
									const chain = $.get(active_editor).chain().focus();

									// If label changed from original selected text, replace the text
									if ($.get(current_link_value).label !== $.get(current_link_value).originalLabel) {
										// Delete selected text and insert new label with link
										chain.deleteSelection().insertContent({
											type: 'text',
											text: $.get(current_link_value).label,
											marks: [
												{ type: 'link', attrs: { href: $.get(current_link_url) || '' } }
											]
										}).run();
									} else {
										// Just wrap existing text in link
										chain.setLink({ href: $.get(current_link_url) || '' }).run();
									}
								} else if ($.get(current_link_element) && !$.get(current_link_entry_id)) {
									// Handle existing TipTap rich-text links (clicked from content)
									$.get(current_link_element).href = $.get(current_link_url) || '';

									$.get(current_link_element).textContent = $.get(current_link_value).label;

									// TODO: Save link into Markdown content
								} else if ($.get(current_link_element) && $.get(current_link_entry_id)) {
									// Handle direct link editing (entry-based)
									$.get(current_link_element).href = $.get(current_link_url) || '';

									$.get(current_link_element).innerText = $.get(current_link_value).label;

									save_edited_value({
										id: $.get(current_link_entry_id),
										value: _.cloneDeep($.get(current_link_value))
									});
								}

								$.set(editing_link, false);
								$.set(editing_existing_link, false);
								$.set(current_link_position, null);
							});

							$.append($$anchor, form_1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	var node_8 = $.sibling(node_5, 2);

	$.component(node_8, () => Dialog.Root, ($$anchor, Dialog_Root_2) => {
		Dialog_Root_2($$anchor, {
			get open() {
				return $.get(editing_video);
			},

			set open($$value) {
				$.set(editing_video, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_3 = $.comment();
				var node_9 = $.first_child(fragment_3);

				$.component(node_9, () => Dialog.Content, ($$anchor, Dialog_Content_2) => {
					Dialog_Content_2($$anchor, {
						class: 'z-[999] sm:max-w-[500px] pt-12',
						children: ($$anchor, $$slotProps) => {
							VideoModal($$anchor, {
								onsave: (url) => {
									if (url && $.get(active_editor)) {
										$.get(active_editor).commands.setYoutubeVideo({ src: url, width: '100%' });
									}

									$.set(editing_video, false);
								}
							});
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	});

	var node_10 = $.sibling(node_8, 2);

	{
		var consequent_1 = ($$anchor) => {
			{
				let $0 = $.derived(() => $.get(current_image_id) === null);

				ImageOverlay($$anchor, {
					get showDelete() {
						return $.get($0);
					},

					onClick: () => {
						$.set(
							current_image_id, // for image entries (non-tiptap)
							$.get(current_image_id),
							true
						);

						$.set(current_image_element, $.get(image_editor_element), true);

						$.set(
							current_image_value,
							{
								url: $.get(image_editor_element)?.src || '',
								alt: $.get(image_editor_element)?.alt || '',
								upload: null // Clear any previous upload
							},
							true
						);

						$.set(editing_image, true);
						$.set(image_overlay_is_visible, false);
					},

					onDelete: () => {
						if ($.get(image_editor_element)) {
							// Remove the image element from the DOM, idk how this works to delete it from the tiptap editor but it does
							$.get(image_editor_element).remove();

							$.set(image_overlay_is_visible, false);
						}
					},

					onMouseDown: () => {
						$.set(suppress_blur_unlock, true);
						clearTimeout(suppress_timer);
						suppress_timer = setTimeout(() => $.set(suppress_blur_unlock, false), 400);
					},

					get visible() {
						return $.get(image_overlay_is_visible);
					},

					set visible($$value) {
						$.set(image_overlay_is_visible, $$value, true);
					},

					get image_element() {
						return $.get(image_editor_element);
					},

					set image_element($$value) {
						$.set(image_editor_element, $$value, true);
					}
				});
			}
		};

		$.if(node_10, ($$render) => {
			if ($.get(image_overlay_is_visible)) $$render(consequent_1);
		});
	}

	var node_11 = $.sibling(node_10, 2);

	$.component(node_11, () => Dialog.Root, ($$anchor, Dialog_Root_3) => {
		Dialog_Root_3($$anchor, {
			get open() {
				return $.get(editing_markdown);
			},

			set open($$value) {
				$.set(editing_markdown, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_6 = $.comment();
				var node_12 = $.first_child(fragment_6);

				$.component(node_12, () => Dialog.Content, ($$anchor, Dialog_Content_3) => {
					Dialog_Content_3($$anchor, {
						class: 'z-[999] sm:max-w-[720px] h-auto max-h-[calc(100vh_-_1rem)] w-full pt-4 gap-0 flex flex-col',
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root_3();
							var node_13 = $.first_child(fragment_7);

							$.component(node_13, () => Dialog.Header, ($$anchor, Dialog_Header) => {
								Dialog_Header($$anchor, {
									title: 'Edit Markdown',
									icon: 'material-symbols:markdown',
									button: { label: 'Save', onclick: handle_markdown_save, hint: '⌘S' },
									class: 'flex items-center justify-between pb-2'
								});
							});

							var node_14 = $.sibling(node_13, 2);

							MarkdownCodeMirror(node_14, {
								autofocus: true,
								get value() {
									return $.get(current_markdown_value);
								},

								set value($$value) {
									$.set(current_markdown_value, $$value, true);
								},
								$$events: { save: handle_markdown_save }
							});

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_6);
			},
			$$slots: { default: true }
		});
	});

	var node_15 = $.sibling(node_11, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_1 = root_5();

			$.each(div_1, 21, () => $.get(related_activities), $.index, ($$anchor, $$item) => {
				var $$array = $.derived(() => $.to_array($.get($$item), 1));
				let user = () => $.get($$array)[0].user;
				let user_avatar = () => $.get($$array)[0].user_avatar;
				var div_2 = root_4();
				var node_16 = $.child(div_2);

				$.component(node_16, () => Avatar.Root, ($$anchor, Avatar_Root) => {
					Avatar_Root($$anchor, {
						class: 'ring-background ring-2 size-8',
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = root_3();
							var node_17 = $.first_child(fragment_8);

							{
								var consequent_2 = ($$anchor) => {
									var fragment_9 = $.comment();
									var node_18 = $.first_child(fragment_9);

									{
										let $0 = $.derived(() => user().name || user().email);

										$.component(node_18, () => Avatar.Image, ($$anchor, Avatar_Image) => {
											Avatar_Image($$anchor, {
												get src() {
													return user_avatar();
												},

												get alt() {
													return $.get($0);
												},
												class: 'object-cover object-center'
											});
										});
									}

									$.append($$anchor, fragment_9);
								};

								$.if(node_17, ($$render) => {
									if (user_avatar()) $$render(consequent_2);
								});
							}

							var node_19 = $.sibling(node_17, 2);

							$.component(node_19, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
								Avatar_Fallback($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text();

										$.template_effect(($0) => $.set_text(text_1, $0), [() => (user().name || user().email).slice(0, 2)]);
										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_2);
				$.append($$anchor, div_2);
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node_15, ($$render) => {
			if ($.get(related_activities).length > 0) $$render(consequent_3);
		});
	}

	var node_20 = $.sibling(node_15, 2);

	{
		var consequent_4 = ($$anchor) => {
			var iframe = root_6();

			$.bind_this(iframe, ($$value) => $.set(node, $$value), () => $.get(node));

			$.template_effect(($0) => $.set_attribute(iframe, 'srcdoc', $0), [
				() => component_iframe_srcdoc({
					head: $site_html(),
					zone: $.get(zone),
					section_id: $$props.section.id,
					symbol_id: $$props.block.id
				})
			]);

			$.event('load', iframe, setup_component_iframe);
			$.replay_events(iframe);
			$.append($$anchor, iframe);
		};

		$.if(node_20, ($$render) => {
			if ($site_html() && $.get(generated_js)) $$render(consequent_4);
		});
	}

	var node_21 = $.sibling(node_20, 2);

	{
		var consequent_5 = ($$anchor) => {
			var div_3 = root_7();
			var pre = $.child(div_3);

			$.html(pre, () => $.get(error), true);
			$.reset(pre);
			$.next(2);
			$.reset(div_3);
			$.transition(1, div_3, () => fade, () => ({ delay: 1000 }));
			$.append($$anchor, div_3);
		};

		$.if(node_21, ($$render) => {
			if ($.get(error)) $$render(consequent_5);
		});
	}

	var node_22 = $.sibling(node_21, 2);

	{
		var consequent_6 = ($$anchor) => {
			var div_4 = root_8();
			let styles;
			var node_23 = $.child(div_4);

			RichTextButton(node_23, {
				icon: 'lucide:heading-1',
				aria_label: 'Heading 1',
				onclick: () => {
					$.get(active_editor).chain().focus().toggleHeading({ level: 1 }).run();
					hide_menus();
				}
			});

			var node_24 = $.sibling(node_23, 2);

			RichTextButton(node_24, {
				icon: 'lucide:heading-2',
				aria_label: 'Heading 2',
				onclick: () => {
					$.get(active_editor).chain().focus().toggleHeading({ level: 2 }).run();
					hide_menus();
				}
			});

			var node_25 = $.sibling(node_24, 2);

			RichTextButton(node_25, {
				icon: 'lucide:heading-3',
				aria_label: 'Heading 3',
				onclick: () => {
					$.get(active_editor).chain().focus().toggleHeading({ level: 3 }).run();
					hide_menus();
				}
			});

			var node_26 = $.sibling(node_25, 2);

			RichTextButton(node_26, {
				icon: 'lucide:code',
				aria_label: 'Code Block',
				onclick: () => {
					$.get(active_editor).chain().focus().toggleCodeBlock().run();
					hide_menus();
				}
			});

			var node_27 = $.sibling(node_26, 2);

			RichTextButton(node_27, {
				icon: 'lucide:quote',
				aria_label: 'Quote',
				onclick: () => {
					$.get(active_editor).chain().focus().toggleBlockquote().run();
					hide_menus();
				}
			});

			var node_28 = $.sibling(node_27, 2);

			RichTextButton(node_28, {
				icon: 'lucide:list',
				aria_label: 'Bullet List',
				onclick: () => {
					$.get(active_editor).chain().focus().toggleBulletList().run();
					hide_menus();
				}
			});

			var node_29 = $.sibling(node_28, 2);

			RichTextButton(node_29, {
				icon: 'lucide:list-ordered',
				aria_label: 'Numbered List',
				onclick: () => {
					$.get(active_editor).chain().focus().toggleOrderedList().run();
					hide_menus();
				}
			});

			var node_30 = $.sibling(node_29, 2);

			RichTextButton(node_30, {
				icon: 'lucide:image',
				aria_label: 'Insert Image',
				onclick: () => {
					hide_menus();
					$.set(current_image_id, null);
					$.set(current_image_element, null);
					$.set(current_image_value, { url: '', alt: '' }, true);
					$.set(editing_image, true);
				}
			});

			var node_31 = $.sibling(node_30, 2);

			RichTextButton(node_31, {
				icon: 'lucide:youtube',
				aria_label: 'Insert YouTube Video',
				onclick: () => {
					hide_menus();
					$.set(editing_video, true);
				}
			});

			var node_32 = $.sibling(node_31, 2);

			RichTextButton(node_32, {
				icon: 'lucide:minus',
				aria_label: 'Horizontal Rule',
				onclick: () => {
					$.get(active_editor).chain().focus().setHorizontalRule().run();
					hide_menus();
				}
			});

			$.reset(div_4);

			$.template_effect(() => styles = $.set_style(div_4, '', styles, {
				top: `${$.get(floating_menu_state).top ?? ''}px`,
				left: `${$.get(floating_menu_state).left ?? ''}px`
			}));

			$.delegated('mousedown', div_4, () => {
				$.set(suppress_blur_unlock, true);
				clearTimeout(suppress_timer);
				suppress_timer = setTimeout(() => $.set(suppress_blur_unlock, false), 400);
			});

			$.append($$anchor, div_4);
		};

		$.if(node_22, ($$render) => {
			if ($.get(floating_menu_state).visible) $$render(consequent_6);
		});
	}

	var node_33 = $.sibling(node_22, 2);

	{
		var consequent_7 = ($$anchor) => {
			var div_5 = root_9();
			let styles_1;
			var node_34 = $.child(div_5);

			RichTextButton(node_34, {
				icon: 'lucide:link',
				aria_label: 'Link',
				onclick: () => {
					// Get selected text to pre-fill the link label
					const selection = $.get(active_editor).view.state.selection;

					const selectedText = $.get(active_editor).view.state.doc.textBetween(selection.from, selection.to);

					$.set(current_link_entry_id, null // No entry for new TipTap links
					);
					$.set(current_link_element, null);

					$.set(
						current_link_value,
						{
							url: '',
							label: selectedText || '',
							active: true,
							originalLabel: selectedText // Store original to check if it changed
						},
						true
					);

					// Hide menus when opening modal
					hide_menus();

					$.set(editing_link, true);
				}
			});

			var node_35 = $.sibling(node_34, 2);

			RichTextButton(node_35, {
				icon: 'lucide:bold',
				aria_label: 'Bold',
				onclick: () => {
					$.get(active_editor).chain().focus().toggleBold().run();
					update_formatting_state();
				},

				get active() {
					return $.get(formatting_state).bold;
				}
			});

			var node_36 = $.sibling(node_35, 2);

			RichTextButton(node_36, {
				icon: 'lucide:italic',
				aria_label: 'Italic',
				onclick: () => {
					$.get(active_editor).chain().focus().toggleItalic().run();
					update_formatting_state();
				},

				get active() {
					return $.get(formatting_state).italic;
				}
			});

			var node_37 = $.sibling(node_36, 2);

			RichTextButton(node_37, {
				icon: 'lucide:highlighter',
				aria_label: 'Highlight',
				onclick: () => {
					$.get(active_editor).chain().focus().toggleHighlight().run();
					update_formatting_state();
				},

				get active() {
					return $.get(formatting_state).highlight;
				}
			});

			var node_38 = $.sibling(node_37, 2);

			RichTextButton(node_38, {
				icon: 'lucide:strikethrough',
				aria_label: 'Strikethrough',
				onclick: () => {
					$.get(active_editor).chain().focus().toggleStrike().run();
					update_formatting_state();
				},

				get active() {
					return $.get(formatting_state).strike;
				}
			});

			$.reset(div_5);

			$.template_effect(() => styles_1 = $.set_style(div_5, '', styles_1, {
				top: `${$.get(bubble_menu_state).top ?? ''}px`,
				left: `${$.get(bubble_menu_state).left ?? ''}px`
			}));

			$.delegated('mousedown', div_5, () => {
				$.set(suppress_blur_unlock, true);
				clearTimeout(suppress_timer);
				suppress_timer = setTimeout(() => $.set(suppress_blur_unlock, false), 400);
			});

			$.append($$anchor, div_5);
		};

		$.if(node_33, ($$render) => {
			if ($.get(bubble_menu_state).visible) $$render(consequent_7);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['click', 'mousedown']);