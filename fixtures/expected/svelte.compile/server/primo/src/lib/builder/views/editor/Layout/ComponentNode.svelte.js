import * as $ from 'svelte/internal/server';
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

export default function ComponentNode($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { value: site } = site_context.getOr({ value: null });
		const dispatch = createEventDispatcher();
		let { block, section } = $$props;
		let node = void 0;
		const fields = $.derived(() => block.fields());

		const entries = $.derived(() => 'page_type' in section
			? section.entries()
			: 'page' in section ? section.entries() : undefined);

		const data = $.derived(() => useContent(section, { target: 'cms' }));
		const component_data = $.derived(() => data() && (data()[$.store_get($$store_subs ??= {}, '$locale', locale)] ?? {}));
		const zone = $.derived(() => 'zone' in section ? section.zone : 'body');

		const related_activities = $.derived(() => getUserActivity({
			filter: (activity) => activity.site_symbol?.id === block.id || activity.page_type_section?.id === section.id || activity.page_section?.id === section.id
		}));

		let bubble_menu_state = { visible: false, top: 0, left: 0 };
		let floating_menu_state = { visible: false, top: 0, left: 0 };
		let image_overlay_is_visible = false;
		let image_editor_element = null;

		async function attach_image_overlay(element, id = null) {
			image_editor_element = element;
			image_overlay_is_visible = true;
			current_image_id = id; // Store the ID for later use
		}

		let editing_markdown = false;
		let current_markdown_entry_id = void 0;
		let current_markdown_value = void 0;
		const markdown_elements = new Map();
		let active_editor = void 0;
		let formatting_state = { bold: false, italic: false, highlight: false, strike: false };

		// Store editor instances by rich-text ID so we can access them later
		let rich_text_editors = new Map();

		const rich_text_classes = {};

		// Keep markdown locked when blur is caused by clicking editor UI buttons
		// so that we don't hydrate the section while it's being edited (and lose focus)
		let suppress_blur_unlock = false;

		let suppress_timer;

		// Event listener cleanup
		let event_listeners = new Map();

		let window_message_handler = null;
		let doc_event_listeners = new Map();
		let error = '';
		let generated_js = '';

		async function generate_component_code(block) {
			const safeData = component_data() && typeof component_data() === 'object' ? component_data() : {};

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
				error = res.error;
				dispatch_mount();
			} else {
				error = '';
				generated_js = res.js;
			}
		}

		let is_editing = false;
		let field_save_timeout;

		function update_formatting_state() {
			if (active_editor) {
				formatting_state = {
					bold: active_editor.isActive('bold'),
					italic: active_editor.isActive('italic'),
					highlight: active_editor.isActive('highlight'),
					strike: active_editor.isActive('strike')
				};
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
			if (!node?.contentDocument || !entries() || !fields()) return;

			// Wait for content to load, then get valid elements
			const valid_elements = await (async () => {
				const doc = node.contentDocument;
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
			const static_fields = fields().filter((f) => static_field_types.includes(f.type)) ?? [];

			for (const field of static_fields) {
				// Check if all elements are already matched
				if (matched_elements.size === valid_elements.length) break;

				// The on-page matcher binds each entry to the next data-key element positionally,
				// so entries must be consumed in render order. A repeater subfield's own index is
				// always 0; its render position comes from its ancestor row-items' indices. Build the
				// full root→leaf index path for each entry and sort lexicographically by it, so leaves
				// under different (and nested) rows can't collide. Without this, subfields mis-bind to
				// the wrong row after a reorder or CLI re-import (storage order != index order).
				const entry_by_id = new Map(entries().map((e) => [e.id, e]));

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

				const path_by_id = new Map(entries().map((e) => [e.id, render_path(e)]));
				const relevant_entries = entries().filter((e) => e.field === field.id).sort((a, b) => compare_paths(path_by_id.get(a.id), path_by_id.get(b.id)));

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
								is_editing = true;
								active_editor = editor;
								update_formatting_state();
							},

							onSelectionUpdate() {
								update_formatting_state();

								// Update menu positions when selection changes
								update_menu_positions();
							},

							onBlur: async () => {
								// Only unlock when blur wasn't caused by clicking editor UI
								if (!suppress_blur_unlock) {
									is_editing = false;
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

										current_link_value = { url: href, label: text, active: true };
										current_link_position = { from: pos, to: pos + text.length };
										current_link_entry_id = null; // No entry for TipTap links
										current_link_element = target;
										editing_existing_link = true;
										editing_link = true;

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

									current_image_value = { url: src, alt };
									current_image_element = target;
									current_image_position = { from: pos, to: pos + (node?.nodeSize || 0) };
									current_image_id = null; // No entry for TipTap images

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
					const entry = entries()?.find((e) => e.id === id); // get updated value (bc formatting differences register as updates)

					event.preventDefault();
					event.stopPropagation();
					current_markdown_entry_id = id;
					current_markdown_value = entry?.value || value;
					editing_markdown = true;
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
					current_link_element = element;
					current_link_entry_id = id;

					// Set current_link_value from the entry
					const entry = entries()?.find((entry) => entry.id === id);

					current_link_value = entry?.value || {
						url: element.href || '',
						label: element.innerText || '',
						active: true
					};

					hide_menus();
					editing_link = true;
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
					is_editing = false;

					// Final save on blur
					clearTimeout(field_save_timeout);

					const target = e.target;

					if (target) save_edited_value({ id, value: target.innerText });
				};

				const focus_handler = () => {
					is_editing = true;
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
			const value = current_markdown_value;

			save_edited_value({ id: current_markdown_entry_id, value });

			const target = markdown_elements.get(current_markdown_entry_id);

			target.innerHTML = convert_markdown_to_html(value);
			editing_markdown = false;
		}

		async function save_edited_value({ id, value }) {
			// Find the entry by ID
			const entry = entries()?.find((entry) => entry.id === id);

			if (!entry) {
				console.error('Entry not found for ID:', id);

				return;
			}

			// Update the entry based on section type
			if ('page_type' in section) {
				PageTypeSectionEntries.update(entry.id, { value });
			} else if ('page' in section) {
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
			if (!node?.contentDocument) return;

			node.contentDocument.querySelectorAll('a:not([data-entry] a):not([data-key] a):not([data-entry]):not([data-key])').forEach((link) => {
				link.addEventListener('click', (e) => {
					e.preventDefault();
					window.open(link.href, '_blank');
				});
			});
		}

		function on_page_scroll() {
			image_overlay_is_visible = false;
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
				if (!node || event.source !== node.contentWindow) return;

				const message = event.data;

				if (!message) return;

				if (message.type === 'component-error') {
					const incoming_error = typeof message.error === 'string'
						? message.error
						: message.error?.toString?.() ?? 'Unknown error';

					error = incoming_error;
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
			if (!node?.contentDocument) return;

			if (editing_link || editing_image || editing_video) {
				hide_menus();

				return;
			}

			// Get selection from the iframe document, not the main document
			const iframeDoc = node.contentDocument;

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
				bubble_menu_state.visible = false;

				return;
			}

			const range = selection.getRangeAt(0);
			const common_ancestor = range.commonAncestorContainer;
			const element = common_ancestor.nodeName === '#text' ? common_ancestor.parentElement : common_ancestor;
			const rich_text_container = element?.closest('[data-rich-text-id]');

			if (rich_text_container) {
				const iframe_rect = node.getBoundingClientRect();
				const rect = range.getBoundingClientRect();

				bubble_menu_state = {
					visible: true,
					left: rect.left + iframe_rect.left,
					top: rect.bottom + iframe_rect.top + 10
				};
			} else {
				bubble_menu_state.visible = false;
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
				const iframe_rect = node.getBoundingClientRect();
				const rect = blockElement.getBoundingClientRect();

				floating_menu_state = {
					visible: true,
					left: rect.left + iframe_rect.left + 10,
					top: rect.top + iframe_rect.top + 7
				};
			} else {
				floating_menu_state.visible = false;
			}
		}

		function hide_menus() {
			bubble_menu_state.visible = false;
			floating_menu_state.visible = false;
		}

		let setup_complete = false;

		function setup_component_iframe() {
			setup_complete = false;

			// Clear previous editor instances
			rich_text_editors.clear();

			// Wait for iframe to be ready
			node.removeEventListener('load', setup);

			if (node.contentDocument.readyState === 'complete') {
				setup();
			} else {
				node.addEventListener('load', setup);
			}

			function setup() {
				const doc = node.contentDocument;

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

					if (node) {
						node.style.height = height + 'px';
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

				setup_complete = true;

				// Every time setup is completed, we send the component to the IFrame.
				// This happens also when the ComponentNode is moved in DOM due to IFrame resetting.
				if (component_data() && generated_js) {
					last_sent_data = _.cloneDeep(component_data());
					send_component_to_iframe(generated_js, component_data());
				}
			}
		}

		let last_code_signature = '';

		// Watch for changes in raw block code or component data and regenerate compiled code
		watch(
			() => ({
				html: block.html,
				css: block.css,
				js: block.js,
				data: component_data(),
				error
			}),
			({ html, css, js, data, error }) => {
				// Wait until content data has resolved (avoid compiling with undefined data)
				if (data === undefined) return;

				// Recompile when any source (html/css/js) changes or an error exists.
				const updated_code_signature = `${html}\n/*__CSS__*/\n${css}\n/*__JS__*/\n${js}`;

				if (last_code_signature !== updated_code_signature || error) {
					generate_component_code(block);
					last_code_signature = updated_code_signature;
				}
			}
		);

		// Watch for compiled code changes and send to iframe when ready
		// Only send when this component's code & data meaningfully changed to avoid
		// triggering re-renders of unrelated symbols.
		let last_sent_data = void 0;

		let last_sent_js = '';

		watch(
			() => ({
				updated_js: generated_js,
				updated_data: component_data(),
				ready: setup_complete && !is_editing
			}),
			({ updated_js, updated_data, ready }) => {
				if (!(ready && updated_data && updated_js)) return;

				// Skip if updated_data is deeply equal to the last sent value
				if (_.isEqual(last_sent_data, updated_data) && last_sent_js === updated_js) return;

				// Store a snapshot to avoid mutation side-effects
				last_sent_data = _.cloneDeep(updated_data);

				last_sent_js = updated_js;
				send_component_to_iframe(updated_js, updated_data);
			}
		);

		async function send_component_to_iframe(js, data) {
			try {
				node.contentWindow.postMessage({ type: 'component', payload: { js, data } }, '*');
				make_content_editable();
			} catch(e) {
				console.error(e);
				error = e;
				dispatch_mount();
			}
		}

		let editing_video = false;
		let editing_image = false;
		let current_image_element = null;
		let current_image_id = null;
		let current_image_value = { url: '', alt: '' };
		let editing_link = false;
		let current_link_element = null;
		let current_link_entry_id = null;
		let current_link_value = { url: '', label: '', active: true };
		let current_link_page = $.derived(() => current_link_value.page ? Pages.one(current_link_value.page) : null);

		let current_link_url = $.derived(() => current_link_page()
			? build_live_page_url(current_link_page())?.pathname
			: current_link_value.url);

		// TipTap image and link position tracking (like RichText)
		let current_image_position = null;

		let current_link_position = null;
		let editing_existing_link = false;
		const editing = $.derived(() => is_editing || editing_video || editing_image || editing_existing_link || editing_link || editing_markdown);

		if ('page_type' in section) {} else if ('page' in section) {}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return editing_image;
					},

					set open($$value) {
						editing_image = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'z-[999] sm:max-w-[500px] pt-12',
								children: ($$renderer) => {
									const field = fields()?.find((f) => entries()?.find((e) => e.id === current_image_id)?.field === f.id) || {
										id: '',
										label: 'Image',
										key: 'image',
										type: 'image',
										config: {},
										index: 0
									};

									const entry = {
										id: current_image_id || '',
										locale: 'en',
										field: field.id,
										index: 0,
										value: current_image_value
									};

									$$renderer.push(`<form>`);

									ImageField($$renderer, {
										field,
										entry,
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

											current_image_value = newValue;
										}
									});

									$$renderer.push(`<!----> <div class="flex justify-end gap-2 mt-2">`);

									if (current_image_element && !current_image_id) {
										$$renderer.push(`<!--[0--><button type="button" class="px-4 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-900 rounded-md">Delete</button>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> <button type="submit" class="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-md">Done</button></div></form>`);
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

			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return editing_link;
					},

					set open($$value) {
						editing_link = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'z-[999] sm:max-w-[500px] pt-12 overflow-visible',
								children: ($$renderer) => {
									const field = fields()?.find((f) => entries()?.find((e) => e.id === current_link_entry_id)?.field === f.id) || {
										id: '',
										label: 'Link',
										key: 'link',
										type: 'link',
										config: {},
										index: 0
									};

									const entry = {
										id: current_link_entry_id || '',
										locale: 'en',
										field: field.id,
										index: 0,
										value: current_link_value || { url: '', label: '', active: true }
									};

									$$renderer.push(`<form>`);

									LinkField($$renderer, {
										field,
										entry,
										onchange: (changeData) => {
											// Extract the actual value from the nested structure
											const fieldKey = Object.keys(changeData)[0];

											const newValue = changeData[fieldKey][0].value;

											current_link_value = newValue;
										}
									});

									$$renderer.push(`<!----> <div class="flex justify-end gap-2 mt-2"><button type="submit" class="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-md">Done</button></div></form>`);
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

			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return editing_video;
					},

					set open($$value) {
						editing_video = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'z-[999] sm:max-w-[500px] pt-12',
								children: ($$renderer) => {
									VideoModal($$renderer, {
										onsave: (url) => {
											if (url && active_editor) {
												active_editor.commands.setYoutubeVideo({ src: url, width: '100%' });
											}

											editing_video = false;
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

			if (image_overlay_is_visible) {
				$$renderer.push('<!--[0-->');

				ImageOverlay($$renderer, {
					showDelete: current_image_id === null,
					onClick: () => {
						current_image_id = current_image_id; // for image entries (non-tiptap)
						current_image_element = image_editor_element;

						current_image_value = {
							url: image_editor_element?.src || '',
							alt: image_editor_element?.alt || '',
							upload: null // Clear any previous upload
						};

						editing_image = true;
						image_overlay_is_visible = false;
					},

					onDelete: () => {
						if (image_editor_element) {
							// Remove the image element from the DOM, idk how this works to delete it from the tiptap editor but it does
							image_editor_element.remove();

							image_overlay_is_visible = false;
						}
					},

					onMouseDown: () => {
						suppress_blur_unlock = true;
						clearTimeout(suppress_timer);
						suppress_timer = setTimeout(() => suppress_blur_unlock = false, 400);
					},

					get visible() {
						return image_overlay_is_visible;
					},

					set visible($$value) {
						image_overlay_is_visible = $$value;
						$$settled = false;
					},

					get image_element() {
						return image_editor_element;
					},

					set image_element($$value) {
						image_editor_element = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return editing_markdown;
					},

					set open($$value) {
						editing_markdown = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'z-[999] sm:max-w-[720px] h-auto max-h-[calc(100vh_-_1rem)] w-full pt-4 gap-0 flex flex-col',
								children: ($$renderer) => {
									if (Dialog.Header) {
										$$renderer.push('<!--[-->');

										Dialog.Header($$renderer, {
											title: 'Edit Markdown',
											icon: 'material-symbols:markdown',
											button: { label: 'Save', onclick: handle_markdown_save, hint: '⌘S' },
											class: 'flex items-center justify-between pb-2'
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									MarkdownCodeMirror($$renderer, {
										autofocus: true,
										get value() {
											return current_markdown_value;
										},

										set value($$value) {
											current_markdown_value = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!---->`);
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

			if (related_activities().length > 0) {
				$$renderer.push(`<!--[0--><div class="pointer-events-none flex justify-center items-start absolute inset-0 ring-inset ring-8 ring-[var(--color-gray-8)]"><!--[-->`);

				const each_array = $.ensure_array_like(related_activities());

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let [{ user, user_avatar }] = each_array[$$index];

					$$renderer.push(`<div class="bg-[var(--color-gray-8)] rounded-bl-lg rounded-br-lg p-2">`);

					if (Avatar.Root) {
						$$renderer.push('<!--[-->');

						Avatar.Root($$renderer, {
							class: 'ring-background ring-2 size-8',
							children: ($$renderer) => {
								if (user_avatar) {
									$$renderer.push('<!--[0-->');

									if (Avatar.Image) {
										$$renderer.push('<!--[-->');

										Avatar.Image($$renderer, {
											src: user_avatar,
											alt: user.name || user.email,
											class: 'object-cover object-center'
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

								if (Avatar.Fallback) {
									$$renderer.push('<!--[-->');

									Avatar.Fallback($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape((user.name || user.email).slice(0, 2))}`);
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

					$$renderer.push(`</div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if ($.store_get($$store_subs ??= {}, '$site_html', site_html) && generated_js) {
				$$renderer.push(`<!--[0--><iframe frameborder="0" title="block"${$.attr('srcdoc', component_iframe_srcdoc({
					head: $.store_get($$store_subs ??= {}, '$site_html', site_html),
					zone: zone(),
					section_id: section.id,
					symbol_id: block.id
				}))} class="svelte-qbpdp0" onload="this.__e=event"></iframe>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (error) {
				$$renderer.push(`<!--[0--><div class="component-error svelte-qbpdp0"><pre class="svelte-qbpdp0">${$.html(error)}</pre> <p class="component-error__hint svelte-qbpdp0">Check console for full error.</p></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (floating_menu_state.visible) {
				$$renderer.push(`<!--[0--><div class="menu floating-menu svelte-qbpdp0"${$.attr_style('', {
					top: `${$.stringify(floating_menu_state.top)}px`,
					left: `${$.stringify(floating_menu_state.left)}px`
				})}>`);

				RichTextButton($$renderer, {
					icon: 'lucide:heading-1',
					aria_label: 'Heading 1',
					onclick: () => {
						active_editor.chain().focus().toggleHeading({ level: 1 }).run();
						hide_menus();
					}
				});

				$$renderer.push(`<!----> `);

				RichTextButton($$renderer, {
					icon: 'lucide:heading-2',
					aria_label: 'Heading 2',
					onclick: () => {
						active_editor.chain().focus().toggleHeading({ level: 2 }).run();
						hide_menus();
					}
				});

				$$renderer.push(`<!----> `);

				RichTextButton($$renderer, {
					icon: 'lucide:heading-3',
					aria_label: 'Heading 3',
					onclick: () => {
						active_editor.chain().focus().toggleHeading({ level: 3 }).run();
						hide_menus();
					}
				});

				$$renderer.push(`<!----> `);

				RichTextButton($$renderer, {
					icon: 'lucide:code',
					aria_label: 'Code Block',
					onclick: () => {
						active_editor.chain().focus().toggleCodeBlock().run();
						hide_menus();
					}
				});

				$$renderer.push(`<!----> `);

				RichTextButton($$renderer, {
					icon: 'lucide:quote',
					aria_label: 'Quote',
					onclick: () => {
						active_editor.chain().focus().toggleBlockquote().run();
						hide_menus();
					}
				});

				$$renderer.push(`<!----> `);

				RichTextButton($$renderer, {
					icon: 'lucide:list',
					aria_label: 'Bullet List',
					onclick: () => {
						active_editor.chain().focus().toggleBulletList().run();
						hide_menus();
					}
				});

				$$renderer.push(`<!----> `);

				RichTextButton($$renderer, {
					icon: 'lucide:list-ordered',
					aria_label: 'Numbered List',
					onclick: () => {
						active_editor.chain().focus().toggleOrderedList().run();
						hide_menus();
					}
				});

				$$renderer.push(`<!----> `);

				RichTextButton($$renderer, {
					icon: 'lucide:image',
					aria_label: 'Insert Image',
					onclick: () => {
						hide_menus();
						current_image_id = null;
						current_image_element = null;
						current_image_value = { url: '', alt: '' };
						editing_image = true;
					}
				});

				$$renderer.push(`<!----> `);

				RichTextButton($$renderer, {
					icon: 'lucide:youtube',
					aria_label: 'Insert YouTube Video',
					onclick: () => {
						hide_menus();
						editing_video = true;
					}
				});

				$$renderer.push(`<!----> `);

				RichTextButton($$renderer, {
					icon: 'lucide:minus',
					aria_label: 'Horizontal Rule',
					onclick: () => {
						active_editor.chain().focus().setHorizontalRule().run();
						hide_menus();
					}
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (bubble_menu_state.visible) {
				$$renderer.push(`<!--[0--><div class="menu bubble-menu svelte-qbpdp0"${$.attr_style('', {
					top: `${$.stringify(bubble_menu_state.top)}px`,
					left: `${$.stringify(bubble_menu_state.left)}px`
				})}>`);

				RichTextButton($$renderer, {
					icon: 'lucide:link',
					aria_label: 'Link',
					onclick: () => {
						// Get selected text to pre-fill the link label
						const selection = active_editor.view.state.selection;

						const selectedText = active_editor.view.state.doc.textBetween(selection.from, selection.to);

						current_link_entry_id = null; // No entry for new TipTap links
						current_link_element = null;

						current_link_value = {
							url: '',
							label: selectedText || '',
							active: true,
							originalLabel: selectedText // Store original to check if it changed
						};

						// Hide menus when opening modal
						hide_menus();

						editing_link = true;
					}
				});

				$$renderer.push(`<!----> `);

				RichTextButton($$renderer, {
					icon: 'lucide:bold',
					aria_label: 'Bold',
					onclick: () => {
						active_editor.chain().focus().toggleBold().run();
						update_formatting_state();
					},
					active: formatting_state.bold
				});

				$$renderer.push(`<!----> `);

				RichTextButton($$renderer, {
					icon: 'lucide:italic',
					aria_label: 'Italic',
					onclick: () => {
						active_editor.chain().focus().toggleItalic().run();
						update_formatting_state();
					},
					active: formatting_state.italic
				});

				$$renderer.push(`<!----> `);

				RichTextButton($$renderer, {
					icon: 'lucide:highlighter',
					aria_label: 'Highlight',
					onclick: () => {
						active_editor.chain().focus().toggleHighlight().run();
						update_formatting_state();
					},
					active: formatting_state.highlight
				});

				$$renderer.push(`<!----> `);

				RichTextButton($$renderer, {
					icon: 'lucide:strikethrough',
					aria_label: 'Strikethrough',
					onclick: () => {
						active_editor.chain().focus().toggleStrike().run();
						update_formatting_state();
					},
					active: formatting_state.strike
				});

				$$renderer.push(`<!----></div>`);
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}