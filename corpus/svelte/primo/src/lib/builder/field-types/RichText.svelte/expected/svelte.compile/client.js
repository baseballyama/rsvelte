import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="toolbar svelte-w985o7"><!> <div class="separator svelte-w985o7"></div> <!> <!> <!> <!> <!> <!> <div class="separator svelte-w985o7"></div> <!> <!> <!></div>`);
var root_1 = $.from_html(`<div class="separator svelte-w985o7"></div> <!>`, 1);
var root_2 = $.from_html(`<div class="absolute top-1 right-1 flex bg-[#222] z-10 rounded-md overflow-hidden opacity-90"><!> <!></div>`);
var root_3 = $.from_html(`<form><!> <div class="flex justify-end gap-2 mt-2"><!></div></form>`);
var root_4 = $.from_html(`<div class="RichText svelte-w985o7"><span class="primo--field-label"> </span> <div class="container svelte-w985o7"><!> <div class="editor prose prose-invert relative svelte-w985o7" role="textbox" aria-label="Rich text editor" tabindex="0"><!></div></div></div> <!> <!> <!> <!>`, 1);

export default function RichText($$anchor, $$props) {
	$.push($$props, true);

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
			command: () => executeWithFormatUpdate(() => $.get(editor).chain().focus().setParagraph().run())
		},
		HEADING_1: {
			label: 'Heading 1',
			key: 'h1',
			icon: 'lucide:heading-1',
			command: () => executeWithFormatUpdate(() => $.get(editor).chain().focus().toggleHeading({ level: 1 }).run())
		},
		HEADING_2: {
			label: 'Heading 2',
			key: 'h2',
			icon: 'lucide:heading-2',
			command: () => executeWithFormatUpdate(() => $.get(editor).chain().focus().toggleHeading({ level: 2 }).run())
		},
		HEADING_3: {
			label: 'Heading 3',
			key: 'h3',
			icon: 'lucide:heading-3',
			command: () => executeWithFormatUpdate(() => $.get(editor).chain().focus().toggleHeading({ level: 3 }).run())
		},
		BULLET_LIST: {
			label: 'Bullet List',
			key: 'bulletList',
			icon: 'lucide:list',
			command: () => executeWithFormatUpdate(() => $.get(editor).chain().focus().toggleBulletList().run())
		},
		ORDERED_LIST: {
			label: 'Numbered List',
			key: 'orderedList',
			icon: 'lucide:list-ordered',
			command: () => executeWithFormatUpdate(() => $.get(editor).chain().focus().toggleOrderedList().run())
		},
		BLOCKQUOTE: {
			label: 'Quote',
			key: 'blockquote',
			icon: 'lucide:quote',
			command: () => executeWithFormatUpdate(() => $.get(editor).chain().focus().toggleBlockquote().run())
		},
		CODE_BLOCK: {
			label: 'Code Block',
			key: 'codeBlock',
			icon: 'lucide:code',
			command: () => executeWithFormatUpdate(() => $.get(editor).chain().focus().toggleCodeBlock().run())
		}
	};

	// Mark constants with embedded commands and icons
	const MARKS = {
		BOLD: {
			key: 'bold',
			icon: 'lucide:bold',
			command: () => executeWithFormatUpdate(() => $.get(editor).chain().focus().toggleBold().run())
		},
		ITALIC: {
			key: 'italic',
			icon: 'lucide:italic',
			command: () => executeWithFormatUpdate(() => $.get(editor).chain().focus().toggleItalic().run())
		},
		STRIKE: {
			key: 'strike',
			icon: 'lucide:strikethrough',
			command: () => executeWithFormatUpdate(() => $.get(editor).chain().focus().toggleStrike().run())
		},
		CODE: {
			key: 'code',
			icon: 'lucide:code',
			command: () => executeWithFormatUpdate(() => $.get(editor).chain().focus().toggleCode().run())
		},
		HIGHLIGHT: {
			key: 'highlight',
			icon: 'lucide:highlighter',
			command: () => executeWithFormatUpdate(() => $.get(editor).chain().focus().toggleHighlight().run())
		},
		LINK: {
			key: 'link',
			icon: 'lucide:link',
			command: () => toggleLink()
		}
	};

	let editor = $.state(void 0);
	let editorElement;

	// Track undo/redo availability
	let canUndo = $.state(false);

	let canRedo = $.state(false);

	// Track active text format/type
	let activeTextFormat = $.state($.proxy(TEXT_FORMATS.PARAGRAPH));

	// Track active marks (bold, italic, etc.)
	let activeMarks = $.state($.proxy({
		bold: false,
		italic: false,
		strike: false,
		code: false,
		highlight: false,
		link: false
	}));

	// Dialog states
	let editing_link = $.state(false);

	let editing_image = $.state(false);
	let editing_video = $.state(false);
	let current_link_value = $.state($.proxy({ url: '', label: '' }));
	let current_image_value = $.state($.proxy({ url: '', alt: '' }));
	let current_video_value = $.state($.proxy({ url: '' }));
	let editing_existing_link = $.state(false);
	let current_link_position = $.state(null);

	// Derived value to resolve page from page ID
	let current_link_page = $.derived(() => $.get(current_link_value).page ? Pages.one($.get(current_link_value).page) : null);

	// Image editor overlay state
	let image_editor_visible = $.state(false);

	let image_editor_element = $.state(null);
	let current_image_position = $.state(null);

	// Function to update active format and marks
	function updateActiveFormat() {
		if (!$.get(editor)) return;

		// Update active text format
		if ($.get(editor).isActive('bulletList')) $.set(activeTextFormat, TEXT_FORMATS.BULLET_LIST, true); else if ($.get(editor).isActive('orderedList')) $.set(activeTextFormat, TEXT_FORMATS.ORDERED_LIST, true); else if ($.get(editor).isActive('blockquote')) $.set(activeTextFormat, TEXT_FORMATS.BLOCKQUOTE, true); else if ($.get(editor).isActive('codeBlock')) $.set(activeTextFormat, TEXT_FORMATS.CODE_BLOCK, true); else if ($.get(editor).isActive('heading', { level: 1 })) $.set(activeTextFormat, TEXT_FORMATS.HEADING_1, true); else if ($.get(editor).isActive('heading', { level: 2 })) $.set(activeTextFormat, TEXT_FORMATS.HEADING_2, true); else if ($.get(editor).isActive('heading', { level: 3 })) $.set(activeTextFormat, TEXT_FORMATS.HEADING_3, true); else $.set(
			activeTextFormat,
			TEXT_FORMATS.PARAGRAPH, // default fallback
			true
		);

		// Update active marks
		$.set(
			activeMarks,
			{
				bold: $.get(editor).isActive(MARKS.BOLD.key),
				italic: $.get(editor).isActive(MARKS.ITALIC.key),
				strike: $.get(editor).isActive(MARKS.STRIKE.key),
				code: $.get(editor).isActive(MARKS.CODE.key),
				highlight: $.get(editor).isActive(MARKS.HIGHLIGHT.key),
				link: $.get(editor).isActive(MARKS.LINK.key)
			},
			true
		);
	}

	onMount(() => {
		$.set(
			editor,
			new Editor({
				element: editorElement,
				extensions: rich_text_extensions,
				content: $$props.entry?.value,
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

									$.set(current_link_value, { url: href, label: text }, true);
									$.set(current_link_position, { from: pos, to: pos + text.length }, true);
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
								$.set(image_editor_element, target, true);
								$.set(current_image_position, { from: pos, to: pos + (node?.nodeSize || 0) }, true);
								$.set(image_editor_visible, true);

								return true;
							}

							return false;
						}
					}
				},

				onUpdate({ editor }) {
					const changeData = {};

					changeData[$$props.field.key] = { 0: { value: editor.getJSON() } };
					$$props.onchange(changeData);
					updateHistoryState();
				},

				onSelectionUpdate() {
					updateHistoryState();
					updateActiveFormat();
				}
			}),
			true
		);

		return () => {
			$.get(editor)?.destroy();
		};
	});

	function updateHistoryState() {
		if (!$.get(editor)) return;

		$.set(canUndo, $.get(editor).can().undo(), true);
		$.set(canRedo, $.get(editor).can().redo(), true);
	}

	function run(command) {
		if (!$.get(editor)) return;

		try {
			command();
		} catch(error) {
			console.error('Editor command failed:', error);
		}
	}

	// Wrapper function for commands that need format updates
	function executeWithFormatUpdate(command) {
		if (!$.get(editor)) return;

		try {
			command();
			updateActiveFormat();
		} catch(error) {
			console.error('Format update command failed:', error);
		}
	}

	// Simple command functions for remaining buttons
	function undo() {
		if (!$.get(editor) || !$.get(canUndo)) return;

		run(() => $.get(editor).chain().focus().undo().run());
	}

	function redo() {
		if (!$.get(editor) || !$.get(canRedo)) return;

		run(() => $.get(editor).chain().focus().redo().run());
	}

	function setHorizontalRule() {
		run(() => $.get(editor).chain().focus().setHorizontalRule().run());
	}

	function toggleLink() {
		if (!$.get(editor)) return;

		// Check if the current selection is already a link
		const linkMark = $.get(editor).getAttributes('link');

		if (linkMark.href) {
			// If we're already in a link, get its ID and text
			const { from, to } = $.get(editor).state.selection;

			const selectedText = $.get(editor).state.doc.textBetween(from, to);

			// Store the link ID for later use
			$.set(current_link_position, null);

			$.set(current_link_value, { url: linkMark.href, label: selectedText }, true);
			$.set(editing_existing_link, true);
		} else {
			// Creating a new link
			const { from, to } = $.get(editor).state.selection;

			const selectedText = $.get(editor).state.doc.textBetween(from, to);

			$.set(current_link_value, { url: '', label: selectedText || '' }, true);
			$.set(current_link_position, null);
			$.set(editing_existing_link, false);
		}

		$.set(editing_link, true);
	}

	function insertImage() {
		$.set(current_image_value, { url: '', alt: '' }, true);
		$.set(current_image_position, null);
		$.set(editing_image, true);
	}

	function insertYoutube() {
		$.set(current_video_value, { url: '' }, true);
		$.set(editing_video, true);
	}

	var fragment = root_4();
	var div = $.first_child(fragment);
	var span = $.child(div);
	var text_1 = $.only_child(span, true);
	var div_1 = $.sibling(span, 2);
	var node_1 = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			var div_2 = root();
			var node_2 = $.child(div_2);

			{
				let $0 = $.derived(() => $.get(activeTextFormat)?.icon);
				let $1 = $.derived(() => $.get(activeTextFormat)?.label);

				let $2 = $.derived(() => [
					{
						label: TEXT_FORMATS.PARAGRAPH.label,
						icon: TEXT_FORMATS.PARAGRAPH.icon,
						on_click: TEXT_FORMATS.PARAGRAPH.command,
						active: $.get(activeTextFormat)?.key === TEXT_FORMATS.PARAGRAPH.key
					},

					{
						label: TEXT_FORMATS.HEADING_1.label,
						icon: TEXT_FORMATS.HEADING_1.icon,
						on_click: TEXT_FORMATS.HEADING_1.command,
						active: $.get(activeTextFormat)?.key === TEXT_FORMATS.HEADING_1.key
					},

					{
						label: TEXT_FORMATS.HEADING_2.label,
						icon: TEXT_FORMATS.HEADING_2.icon,
						on_click: TEXT_FORMATS.HEADING_2.command,
						active: $.get(activeTextFormat)?.key === TEXT_FORMATS.HEADING_2.key
					},

					{
						label: TEXT_FORMATS.HEADING_3.label,
						icon: TEXT_FORMATS.HEADING_3.icon,
						on_click: TEXT_FORMATS.HEADING_3.command,
						active: $.get(activeTextFormat)?.key === TEXT_FORMATS.HEADING_3.key
					},

					{
						label: TEXT_FORMATS.BULLET_LIST.label,
						icon: TEXT_FORMATS.BULLET_LIST.icon,
						on_click: TEXT_FORMATS.BULLET_LIST.command,
						active: $.get(activeTextFormat)?.key === TEXT_FORMATS.BULLET_LIST.key
					},

					{
						label: TEXT_FORMATS.ORDERED_LIST.label,
						icon: TEXT_FORMATS.ORDERED_LIST.icon,
						on_click: TEXT_FORMATS.ORDERED_LIST.command,
						active: $.get(activeTextFormat)?.key === TEXT_FORMATS.ORDERED_LIST.key
					},

					{
						label: TEXT_FORMATS.BLOCKQUOTE.label,
						icon: TEXT_FORMATS.BLOCKQUOTE.icon,
						on_click: TEXT_FORMATS.BLOCKQUOTE.command,
						active: $.get(activeTextFormat)?.key === TEXT_FORMATS.BLOCKQUOTE.key
					},

					{
						label: TEXT_FORMATS.CODE_BLOCK.label,
						icon: TEXT_FORMATS.CODE_BLOCK.icon,
						on_click: TEXT_FORMATS.CODE_BLOCK.command,
						active: $.get(activeTextFormat)?.key === TEXT_FORMATS.CODE_BLOCK.key
					}
				]);

				MenuPopup(node_2, {
					get icon() {
						return $.get($0);
					},

					get label() {
						return $.get($1);
					},

					get options() {
						return $.get($2);
					}
				});
			}

			var node_3 = $.sibling(node_2, 4);

			RichTextButton(node_3, {
				get icon() {
					return MARKS.BOLD.icon;
				},

				get active() {
					return $.get(activeMarks).bold;
				},

				get onclick() {
					return MARKS.BOLD.command;
				},
				aria_label: 'Bold'
			});

			var node_4 = $.sibling(node_3, 2);

			RichTextButton(node_4, {
				get icon() {
					return MARKS.ITALIC.icon;
				},

				get active() {
					return $.get(activeMarks).italic;
				},

				get onclick() {
					return MARKS.ITALIC.command;
				},
				aria_label: 'Italic'
			});

			var node_5 = $.sibling(node_4, 2);

			RichTextButton(node_5, {
				get icon() {
					return MARKS.STRIKE.icon;
				},

				get active() {
					return $.get(activeMarks).strike;
				},

				get onclick() {
					return MARKS.STRIKE.command;
				},
				aria_label: 'Strikethrough'
			});

			var node_6 = $.sibling(node_5, 2);

			RichTextButton(node_6, {
				get icon() {
					return MARKS.CODE.icon;
				},

				get active() {
					return $.get(activeMarks).code;
				},

				get onclick() {
					return MARKS.CODE.command;
				},
				aria_label: 'Inline code'
			});

			var node_7 = $.sibling(node_6, 2);

			RichTextButton(node_7, {
				get icon() {
					return MARKS.HIGHLIGHT.icon;
				},

				get active() {
					return $.get(activeMarks).highlight;
				},

				get onclick() {
					return MARKS.HIGHLIGHT.command;
				},
				aria_label: 'Highlight'
			});

			var node_8 = $.sibling(node_7, 2);

			RichTextButton(node_8, {
				get icon() {
					return MARKS.LINK.icon;
				},

				get active() {
					return $.get(activeMarks).link;
				},

				get onclick() {
					return MARKS.LINK.command;
				},
				aria_label: 'Link'
			});

			var node_9 = $.sibling(node_8, 4);

			RichTextButton(node_9, {
				icon: 'lucide:minus',
				onclick: setHorizontalRule,
				aria_label: 'Horizontal rule'
			});

			var node_10 = $.sibling(node_9, 2);

			RichTextButton(node_10, {
				icon: 'lucide:image',
				onclick: insertImage,
				aria_label: 'Insert image'
			});

			var node_11 = $.sibling(node_10, 2);

			RichTextButton(node_11, {
				icon: 'lucide:youtube',
				onclick: insertYoutube,
				aria_label: 'Insert YouTube video'
			});

			$.reset(div_2);
			$.transition(1, div_2, () => fade, () => ({ duration: 200 }));
			$.append($$anchor, div_2);
		};

		$.if(node_1, ($$render) => {
			if ($.get(editor)) $$render(consequent);
		});
	}

	var div_3 = $.sibling(node_1, 2);
	var node_12 = $.child(div_3);

	{
		var consequent_3 = ($$anchor) => {
			var div_4 = root_2();
			var node_13 = $.child(div_4);

			{
				var consequent_1 = ($$anchor) => {
					RichTextButton($$anchor, { icon: 'lucide:undo-2', onclick: undo, aria_label: 'Undo' });
				};

				$.if(node_13, ($$render) => {
					if ($.get(canUndo)) $$render(consequent_1);
				});
			}

			var node_14 = $.sibling(node_13, 2);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_2 = root_1();
					var node_15 = $.sibling($.first_child(fragment_2), 2);

					RichTextButton(node_15, { icon: 'lucide:redo-2', onclick: redo, aria_label: 'Redo' });
					$.append($$anchor, fragment_2);
				};

				$.if(node_14, ($$render) => {
					if ($.get(canRedo)) $$render(consequent_2);
				});
			}

			$.reset(div_4);
			$.transition(1, div_4, () => fade, () => ({ duration: 200 }));
			$.append($$anchor, div_4);
		};

		$.if(node_12, ($$render) => {
			if ($.get(canUndo) || $.get(canRedo)) $$render(consequent_3);
		});
	}

	$.reset(div_3);
	$.bind_this(div_3, ($$value) => editorElement = $$value, () => editorElement);
	$.reset(div_1);
	$.reset(div);

	var node_16 = $.sibling(div, 2);

	$.component(node_16, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			get open() {
				return $.get(editing_link);
			},

			set open($$value) {
				$.set(editing_link, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_3 = $.comment();
				var node_17 = $.first_child(fragment_3);

				$.component(node_17, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'z-[999] sm:max-w-[500px] pt-12 overflow-visible',
						children: ($$anchor, $$slotProps) => {
							var form = root_3();
							var node_18 = $.child(form);

							{
								let $0 = $.derived(() => ({
									id: 'temp-entry',
									locale: 'en',
									value: $.get(current_link_value),
									field: 'temp-link',
									index: 0
								}));

								LinkField(node_18, {
									field: {
										id: 'temp-link',
										label: 'Link',
										key: 'link',
										type: 'link',
										config: {},
										index: 0
									},

									get entry() {
										return $.get($0);
									},

									onchange: (changeData) => {
										const fieldKey = Object.keys(changeData)[0];
										const newValue = changeData[fieldKey][0].value;

										console.log({ changeData, newValue });
										$.set(current_link_value, newValue, true);
									}
								});
							}

							var div_5 = $.sibling(node_18, 2);
							var node_19 = $.child(div_5);

							Button(node_19, {
								type: 'submit',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Done');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							$.reset(div_5);
							$.reset(form);

							$.event('submit', form, (e) => {
								e.preventDefault();

								if (!$.get(editor) || !$.get(current_link_value).label) return;

								const chain = $.get(editor).chain().focus();
								const { from, to } = $.get(editor).state.selection;
								const selectedText = $.get(editor).state.doc.textBetween(from, to);

								// Get the final URL (either from page ID or direct URL)
								let finalUrl = $.get(current_link_value).url;

								if ($.get(current_link_page)) {
									finalUrl = build_live_page_url($.get(current_link_page))?.pathname || '';
								}

								if ($.get(editing_existing_link) && $.get(current_link_position)) {
									// Editing an existing link - use stored position
									const { from, to } = $.get(current_link_position);

									chain.setTextSelection({ from, to }).deleteSelection().insertContent({
										type: 'text',
										text: $.get(current_link_value).label,
										marks: [{ type: 'link', attrs: { href: finalUrl } }]
									}).run();
								} else {
									// Creating a new link
									const linkId = createUniqueID();

									// Determine if we need to delete selection first
									const shouldDeleteSelection = selectedText;

									if (shouldDeleteSelection) {
										chain.deleteSelection().insertContent({
											type: 'text',
											text: $.get(current_link_value).label,
											marks: [
												{ type: 'link', attrs: { href: finalUrl, 'data-id': linkId } }
											]
										}).run();
									} else {
										chain.insertContent({
											type: 'text',
											text: $.get(current_link_value).label,
											marks: [
												{ type: 'link', attrs: { href: finalUrl, 'data-id': linkId } }
											]
										}).run();
									}
								}

								$.set(editing_link, false);
								$.set(editing_existing_link, false);
								$.set(current_link_position, null);
							});

							$.append($$anchor, form);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	});

	var node_20 = $.sibling(node_16, 2);

	$.component(node_20, () => Dialog.Root, ($$anchor, Dialog_Root_1) => {
		Dialog_Root_1($$anchor, {
			get open() {
				return $.get(editing_image);
			},

			set open($$value) {
				$.set(editing_image, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_4 = $.comment();
				var node_21 = $.first_child(fragment_4);

				$.component(node_21, () => Dialog.Content, ($$anchor, Dialog_Content_1) => {
					Dialog_Content_1($$anchor, {
						class: 'z-[999] sm:max-w-[500px] pt-12 overflow-visible',
						children: ($$anchor, $$slotProps) => {
							var form_1 = root_3();
							var node_22 = $.child(form_1);

							{
								let $0 = $.derived(() => ({
									id: 'temp-entry',
									locale: 'en',
									value: $.get(current_image_value),
									field: 'temp-image',
									index: 0
								}));

								ImageField(node_22, {
									field: {
										id: 'temp-image',
										label: 'Image',
										key: 'image',
										type: 'image',
										config: {},
										index: 0
									},

									get entry() {
										return $.get($0);
									},

									onchange: (changeData) => {
										const fieldKey = Object.keys(changeData)[0];
										const newValue = changeData[fieldKey][0].value;

										$.set(current_image_value, newValue, true);
									}
								});
							}

							var div_6 = $.sibling(node_22, 2);
							var node_23 = $.child(div_6);

							Button(node_23, {
								type: 'submit',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Done');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							$.reset(div_6);
							$.reset(form_1);

							$.event('submit', form_1, (e) => {
								e.preventDefault();

								if (!$.get(editor) || !$.get(current_image_value).url) return;

								if ($.get(current_image_position)) {
									// Editing an existing image - use stored position
									const { from, to } = $.get(current_image_position);

									run(() => $.get(editor).chain().setTextSelection({ from, to }).deleteSelection().insertContent({
										type: 'image',
										attrs: {
											src: $.get(current_image_value).url,
											alt: $.get(current_image_value).alt
										}
									}).run());
								} else {
									// Creating a new image
									run(() => $.get(editor).chain().focus().insertContent({
										type: 'image',
										attrs: {
											src: $.get(current_image_value).url,
											alt: $.get(current_image_value).alt,
											'data-id': createUniqueID()
										}
									}).run());
								}

								$.set(editing_image, false);
								$.set(current_image_position, null);
							});

							$.append($$anchor, form_1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_4);
			},
			$$slots: { default: true }
		});
	});

	var node_24 = $.sibling(node_20, 2);

	{
		var consequent_4 = ($$anchor) => {
			VideoModal($$anchor, {
				onsave: () => {
					if ($.get(current_video_value).url) {
						run(() => $.get(editor).commands.setYoutubeVideo({ src: $.get(current_video_value).url }));
					}

					$.set(editing_video, false);
				},

				get value() {
					return $.get(current_video_value);
				},

				set value($$value) {
					$.set(current_video_value, $$value, true);
				}
			});
		};

		$.if(node_24, ($$render) => {
			if ($.get(editing_video)) $$render(consequent_4);
		});
	}

	var node_25 = $.sibling(node_24, 2);

	{
		var consequent_5 = ($$anchor) => {
			ImageEditorOverlay($$anchor, {
				onClick: () => {
					// Open the image dialog with current image data
					$.set(editing_image, true);

					$.set(image_editor_visible, false);
				},

				onDelete: () => {
					// Delete the hovered image using editor commands
					if ($.get(editor) && $.get(current_image_position)) {
						const { from, to } = $.get(current_image_position);

						run(() => $.get(editor).chain().setTextSelection({ from, to }).deleteSelection().setTextSelection(from).focus().run());
					}

					$.set(image_editor_visible, false);
					$.set(current_image_position, null);
				},

				get visible() {
					return $.get(image_editor_visible);
				},

				set visible($$value) {
					$.set(image_editor_visible, $$value, true);
				},

				get image_element() {
					return $.get(image_editor_element);
				},

				set image_element($$value) {
					$.set(image_editor_element, $$value, true);
				}
			});
		};

		$.if(node_25, ($$render) => {
			if ($.get(image_editor_visible)) $$render(consequent_5);
		});
	}

	$.template_effect(() => $.set_text(text_1, $$props.field.label));
	$.append($$anchor, fragment);
	$.pop();
}