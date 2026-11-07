import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { fade } from 'svelte/transition';
import { Editor } from '@tiptap/core';
import { rich_text_extensions } from '$lib/builder/rich-text/extensions';
import RichTextButton from '$lib/builder/views/editor/Layout/RichTextButton.svelte';
import { loadIcons } from '@iconify/svelte';
import MenuPopup from '$lib/builder/ui/Dropdown.svelte';
import { Button } from '$lib/components/ui/button';
import * as Dialog from '$lib/components/ui/dialog';
import VideoModal from '$lib/builder/views/modal/VideoModal.svelte';
import LinkField from '$lib/builder/field-types/Link.svelte';
import ImageField from '$lib/builder/field-types/ImageField.svelte';
import ImageEditorOverlay from '$lib/builder/components/ImageEditorOverlay.svelte';
import { Pages } from '$lib/pocketbase/collections';
import { build_live_page_url } from '$lib/pages';
import { createUniqueID } from '$lib/builder/utils';

export default function RichText($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { field, entry, onchange } = $$props;

		// Preload all icons used in the dropdown to prevent layout shift
		loadIcons([
			'lucide:pilcrow',
			'lucide:heading-1',
			'lucide:heading-2',
			'lucide:heading-3',
			'lucide:list',
			'lucide:list-ordered',
			'lucide:quote',
			'lucide:code',
			'lucide:bold',
			'lucide:italic',
			'lucide:strikethrough',
			'lucide:highlighter',
			'lucide:link',
			'lucide:minus',
			'lucide:image',
			'lucide:youtube',
			'lucide:undo-2',
			'lucide:redo-2'
		]);

		// Types
		// Text format constants with embedded commands
		const TEXT_FORMATS = {
			PARAGRAPH: {
				label: 'Paragraph',
				key: 'paragraph',
				icon: 'lucide:pilcrow',
				command: () => executeWithFormatUpdate(() => editor.chain().focus().setParagraph().run())
			},
			HEADING_1: {
				label: 'Heading 1',
				key: 'h1',
				icon: 'lucide:heading-1',
				command: () => executeWithFormatUpdate(() => editor.chain().focus().toggleHeading({ level: 1 }).run())
			},
			HEADING_2: {
				label: 'Heading 2',
				key: 'h2',
				icon: 'lucide:heading-2',
				command: () => executeWithFormatUpdate(() => editor.chain().focus().toggleHeading({ level: 2 }).run())
			},
			HEADING_3: {
				label: 'Heading 3',
				key: 'h3',
				icon: 'lucide:heading-3',
				command: () => executeWithFormatUpdate(() => editor.chain().focus().toggleHeading({ level: 3 }).run())
			},
			BULLET_LIST: {
				label: 'Bullet List',
				key: 'bulletList',
				icon: 'lucide:list',
				command: () => executeWithFormatUpdate(() => editor.chain().focus().toggleBulletList().run())
			},
			ORDERED_LIST: {
				label: 'Numbered List',
				key: 'orderedList',
				icon: 'lucide:list-ordered',
				command: () => executeWithFormatUpdate(() => editor.chain().focus().toggleOrderedList().run())
			},
			BLOCKQUOTE: {
				label: 'Quote',
				key: 'blockquote',
				icon: 'lucide:quote',
				command: () => executeWithFormatUpdate(() => editor.chain().focus().toggleBlockquote().run())
			},
			CODE_BLOCK: {
				label: 'Code Block',
				key: 'codeBlock',
				icon: 'lucide:code',
				command: () => executeWithFormatUpdate(() => editor.chain().focus().toggleCodeBlock().run())
			}
		};

		// Mark constants with embedded commands and icons
		const MARKS = {
			BOLD: {
				key: 'bold',
				icon: 'lucide:bold',
				command: () => executeWithFormatUpdate(() => editor.chain().focus().toggleBold().run())
			},
			ITALIC: {
				key: 'italic',
				icon: 'lucide:italic',
				command: () => executeWithFormatUpdate(() => editor.chain().focus().toggleItalic().run())
			},
			STRIKE: {
				key: 'strike',
				icon: 'lucide:strikethrough',
				command: () => executeWithFormatUpdate(() => editor.chain().focus().toggleStrike().run())
			},
			CODE: {
				key: 'code',
				icon: 'lucide:code',
				command: () => executeWithFormatUpdate(() => editor.chain().focus().toggleCode().run())
			},
			HIGHLIGHT: {
				key: 'highlight',
				icon: 'lucide:highlighter',
				command: () => executeWithFormatUpdate(() => editor.chain().focus().toggleHighlight().run())
			},
			LINK: {
				key: 'link',
				icon: 'lucide:link',
				command: () => toggleLink()
			}
		};

		let editor = void 0;
		let editorElement;

		// Track undo/redo availability
		let canUndo = false;

		let canRedo = false;

		// Track active text format/type
		let activeTextFormat = TEXT_FORMATS.PARAGRAPH;

		// Track active marks (bold, italic, etc.)
		let activeMarks = {
			bold: false,
			italic: false,
			strike: false,
			code: false,
			highlight: false,
			link: false
		};

		// Dialog states
		let editing_link = false;

		let editing_image = false;
		let editing_video = false;
		let current_link_value = { url: '', label: '' };
		let current_image_value = { url: '', alt: '' };
		let current_video_value = { url: '' };
		let editing_existing_link = false;
		let current_link_position = null;

		// Derived value to resolve page from page ID
		let current_link_page = $.derived(() => current_link_value.page ? Pages.one(current_link_value.page) : null);

		// Image editor overlay state
		let image_editor_visible = false;

		let image_editor_element = null;
		let current_image_position = null;

		// Function to update active format and marks
		function updateActiveFormat() {
			if (!editor) return;

			// Update active text format
			if (editor.isActive('bulletList')) activeTextFormat = TEXT_FORMATS.BULLET_LIST; else if (editor.isActive('orderedList')) activeTextFormat = TEXT_FORMATS.ORDERED_LIST; else if (editor.isActive('blockquote')) activeTextFormat = TEXT_FORMATS.BLOCKQUOTE; else if (editor.isActive('codeBlock')) activeTextFormat = TEXT_FORMATS.CODE_BLOCK; else if (editor.isActive('heading', { level: 1 })) activeTextFormat = TEXT_FORMATS.HEADING_1; else if (editor.isActive('heading', { level: 2 })) activeTextFormat = TEXT_FORMATS.HEADING_2; else if (editor.isActive('heading', { level: 3 })) activeTextFormat = TEXT_FORMATS.HEADING_3; else activeTextFormat = TEXT_FORMATS.PARAGRAPH; // default fallback

			// Update active marks
			activeMarks = {
				bold: editor.isActive(MARKS.BOLD.key),
				italic: editor.isActive(MARKS.ITALIC.key),
				strike: editor.isActive(MARKS.STRIKE.key),
				code: editor.isActive(MARKS.CODE.key),
				highlight: editor.isActive(MARKS.HIGHLIGHT.key),
				link: editor.isActive(MARKS.LINK.key)
			};
		}

		onMount(() => {
			editor = new Editor({
				element: editorElement,
				extensions: rich_text_extensions,
				content: entry?.value,
				editorProps: {
					attributes: { class: 'tiptap-editor' },
					handleDOMEvents: {
						click: (view, event) => {
							const target = event.target;

							if (target.tagName === 'A') {
								event.preventDefault();

								// Get the position of the clicked link
								const pos = view.posAtDOM(target, 0);

								const resolved = view.state.doc.resolve(pos);
								const linkMark = resolved.marks().find((mark) => mark.type.name === 'link');

								console.log('Link clicked:', { target, pos, linkMark, href: linkMark?.attrs?.href });

								if (linkMark) {
									// Extract link data
									const href = linkMark.attrs.href || '';

									const text = target.textContent || '';

									current_link_value = { url: href, label: text };
									current_link_position = { from: pos, to: pos + text.length };
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
								image_editor_element = target;
								current_image_position = { from: pos, to: pos + (node?.nodeSize || 0) };
								image_editor_visible = true;

								return true;
							}

							return false;
						}
					}
				},

				onUpdate({ editor }) {
					const changeData = {};

					changeData[field.key] = { 0: { value: editor.getJSON() } };
					onchange(changeData);
					updateHistoryState();
				},

				onSelectionUpdate() {
					updateHistoryState();
					updateActiveFormat();
				}
			});

			return () => {
				editor?.destroy();
			};
		});

		function updateHistoryState() {
			if (!editor) return;

			canUndo = editor.can().undo();
			canRedo = editor.can().redo();
		}

		function run(command) {
			if (!editor) return;

			try {
				command();
			} catch(error) {
				console.error('Editor command failed:', error);
			}
		}

		// Wrapper function for commands that need format updates
		function executeWithFormatUpdate(command) {
			if (!editor) return;

			try {
				command();
				updateActiveFormat();
			} catch(error) {
				console.error('Format update command failed:', error);
			}
		}

		// Simple command functions for remaining buttons
		function undo() {
			if (!editor || !canUndo) return;

			run(() => editor.chain().focus().undo().run());
		}

		function redo() {
			if (!editor || !canRedo) return;

			run(() => editor.chain().focus().redo().run());
		}

		function setHorizontalRule() {
			run(() => editor.chain().focus().setHorizontalRule().run());
		}

		function toggleLink() {
			if (!editor) return;

			// Check if the current selection is already a link
			const linkMark = editor.getAttributes('link');

			if (linkMark.href) {
				// If we're already in a link, get its ID and text
				const { from, to } = editor.state.selection;

				const selectedText = editor.state.doc.textBetween(from, to);

				// Store the link ID for later use
				current_link_position = null;

				current_link_value = { url: linkMark.href, label: selectedText };
				editing_existing_link = true;
			} else {
				// Creating a new link
				const { from, to } = editor.state.selection;

				const selectedText = editor.state.doc.textBetween(from, to);

				current_link_value = { url: '', label: selectedText || '' };
				current_link_position = null;
				editing_existing_link = false;
			}

			editing_link = true;
		}

		function insertImage() {
			current_image_value = { url: '', alt: '' };
			current_image_position = null;
			editing_image = true;
		}

		function insertYoutube() {
			current_video_value = { url: '' };
			editing_video = true;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="RichText svelte-w985o7"><span class="primo--field-label">${$.escape(field.label)}</span> <div class="container svelte-w985o7">`);

			if (editor) {
				$$renderer.push(`<!--[0--><div class="toolbar svelte-w985o7">`);

				MenuPopup($$renderer, {
					icon: activeTextFormat?.icon,
					label: activeTextFormat?.label,
					options: [
						{
							label: TEXT_FORMATS.PARAGRAPH.label,
							icon: TEXT_FORMATS.PARAGRAPH.icon,
							on_click: TEXT_FORMATS.PARAGRAPH.command,
							active: activeTextFormat?.key === TEXT_FORMATS.PARAGRAPH.key
						},

						{
							label: TEXT_FORMATS.HEADING_1.label,
							icon: TEXT_FORMATS.HEADING_1.icon,
							on_click: TEXT_FORMATS.HEADING_1.command,
							active: activeTextFormat?.key === TEXT_FORMATS.HEADING_1.key
						},

						{
							label: TEXT_FORMATS.HEADING_2.label,
							icon: TEXT_FORMATS.HEADING_2.icon,
							on_click: TEXT_FORMATS.HEADING_2.command,
							active: activeTextFormat?.key === TEXT_FORMATS.HEADING_2.key
						},

						{
							label: TEXT_FORMATS.HEADING_3.label,
							icon: TEXT_FORMATS.HEADING_3.icon,
							on_click: TEXT_FORMATS.HEADING_3.command,
							active: activeTextFormat?.key === TEXT_FORMATS.HEADING_3.key
						},

						{
							label: TEXT_FORMATS.BULLET_LIST.label,
							icon: TEXT_FORMATS.BULLET_LIST.icon,
							on_click: TEXT_FORMATS.BULLET_LIST.command,
							active: activeTextFormat?.key === TEXT_FORMATS.BULLET_LIST.key
						},

						{
							label: TEXT_FORMATS.ORDERED_LIST.label,
							icon: TEXT_FORMATS.ORDERED_LIST.icon,
							on_click: TEXT_FORMATS.ORDERED_LIST.command,
							active: activeTextFormat?.key === TEXT_FORMATS.ORDERED_LIST.key
						},

						{
							label: TEXT_FORMATS.BLOCKQUOTE.label,
							icon: TEXT_FORMATS.BLOCKQUOTE.icon,
							on_click: TEXT_FORMATS.BLOCKQUOTE.command,
							active: activeTextFormat?.key === TEXT_FORMATS.BLOCKQUOTE.key
						},

						{
							label: TEXT_FORMATS.CODE_BLOCK.label,
							icon: TEXT_FORMATS.CODE_BLOCK.icon,
							on_click: TEXT_FORMATS.CODE_BLOCK.command,
							active: activeTextFormat?.key === TEXT_FORMATS.CODE_BLOCK.key
						}
					]
				});

				$$renderer.push(`<!----> <div class="separator svelte-w985o7"></div> `);

				RichTextButton($$renderer, {
					icon: MARKS.BOLD.icon,
					active: activeMarks.bold,
					onclick: MARKS.BOLD.command,
					aria_label: 'Bold'
				});

				$$renderer.push(`<!----> `);

				RichTextButton($$renderer, {
					icon: MARKS.ITALIC.icon,
					active: activeMarks.italic,
					onclick: MARKS.ITALIC.command,
					aria_label: 'Italic'
				});

				$$renderer.push(`<!----> `);

				RichTextButton($$renderer, {
					icon: MARKS.STRIKE.icon,
					active: activeMarks.strike,
					onclick: MARKS.STRIKE.command,
					aria_label: 'Strikethrough'
				});

				$$renderer.push(`<!----> `);

				RichTextButton($$renderer, {
					icon: MARKS.CODE.icon,
					active: activeMarks.code,
					onclick: MARKS.CODE.command,
					aria_label: 'Inline code'
				});

				$$renderer.push(`<!----> `);

				RichTextButton($$renderer, {
					icon: MARKS.HIGHLIGHT.icon,
					active: activeMarks.highlight,
					onclick: MARKS.HIGHLIGHT.command,
					aria_label: 'Highlight'
				});

				$$renderer.push(`<!----> `);

				RichTextButton($$renderer, {
					icon: MARKS.LINK.icon,
					active: activeMarks.link,
					onclick: MARKS.LINK.command,
					aria_label: 'Link'
				});

				$$renderer.push(`<!----> <div class="separator svelte-w985o7"></div> `);

				RichTextButton($$renderer, {
					icon: 'lucide:minus',
					onclick: setHorizontalRule,
					aria_label: 'Horizontal rule'
				});

				$$renderer.push(`<!----> `);

				RichTextButton($$renderer, {
					icon: 'lucide:image',
					onclick: insertImage,
					aria_label: 'Insert image'
				});

				$$renderer.push(`<!----> `);

				RichTextButton($$renderer, {
					icon: 'lucide:youtube',
					onclick: insertYoutube,
					aria_label: 'Insert YouTube video'
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="editor prose prose-invert relative svelte-w985o7" role="textbox" aria-label="Rich text editor" tabindex="0">`);

			if (canUndo || canRedo) {
				$$renderer.push(`<!--[0--><div class="absolute top-1 right-1 flex bg-[#222] z-10 rounded-md overflow-hidden opacity-90">`);

				if (canUndo) {
					$$renderer.push('<!--[0-->');
					RichTextButton($$renderer, { icon: 'lucide:undo-2', onclick: undo, aria_label: 'Undo' });
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (canRedo) {
					$$renderer.push(`<!--[0--><div class="separator svelte-w985o7"></div> `);
					RichTextButton($$renderer, { icon: 'lucide:redo-2', onclick: redo, aria_label: 'Redo' });
					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div></div> `);

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
									$$renderer.push(`<form>`);

									LinkField($$renderer, {
										field: {
											id: 'temp-link',
											label: 'Link',
											key: 'link',
											type: 'link',
											config: {},
											index: 0
										},
										entry: {
											id: 'temp-entry',
											locale: 'en',
											value: current_link_value,
											field: 'temp-link',
											index: 0
										},

										onchange: (changeData) => {
											const fieldKey = Object.keys(changeData)[0];
											const newValue = changeData[fieldKey][0].value;

											console.log({ changeData, newValue });
											current_link_value = newValue;
										}
									});

									$$renderer.push(`<!----> <div class="flex justify-end gap-2 mt-2">`);

									Button($$renderer, {
										type: 'submit',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Done`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----></div></form>`);
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
								class: 'z-[999] sm:max-w-[500px] pt-12 overflow-visible',
								children: ($$renderer) => {
									$$renderer.push(`<form>`);

									ImageField($$renderer, {
										field: {
											id: 'temp-image',
											label: 'Image',
											key: 'image',
											type: 'image',
											config: {},
											index: 0
										},
										entry: {
											id: 'temp-entry',
											locale: 'en',
											value: current_image_value,
											field: 'temp-image',
											index: 0
										},

										onchange: (changeData) => {
											const fieldKey = Object.keys(changeData)[0];
											const newValue = changeData[fieldKey][0].value;

											current_image_value = newValue;
										}
									});

									$$renderer.push(`<!----> <div class="flex justify-end gap-2 mt-2">`);

									Button($$renderer, {
										type: 'submit',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Done`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----></div></form>`);
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

			if (editing_video) {
				$$renderer.push('<!--[0-->');

				VideoModal($$renderer, {
					onsave: () => {
						if (current_video_value.url) {
							run(() => editor.commands.setYoutubeVideo({ src: current_video_value.url }));
						}

						editing_video = false;
					},

					get value() {
						return current_video_value;
					},

					set value($$value) {
						current_video_value = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (image_editor_visible) {
				$$renderer.push('<!--[0-->');

				ImageEditorOverlay($$renderer, {
					onClick: () => {
						// Open the image dialog with current image data
						editing_image = true;

						image_editor_visible = false;
					},

					onDelete: () => {
						// Delete the hovered image using editor commands
						if (editor && current_image_position) {
							const { from, to } = current_image_position;

							run(() => editor.chain().setTextSelection({ from, to }).deleteSelection().setTextSelection(from).focus().run());
						}

						image_editor_visible = false;
						current_image_position = null;
					},

					get visible() {
						return image_editor_visible;
					},

					set visible($$value) {
						image_editor_visible = $$value;
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