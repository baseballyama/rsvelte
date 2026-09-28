import * as $ from 'svelte/internal/server';
import './ImageNodeStyles.css';

import {
	$getSelection as getSelection,
	$isNodeSelection as isNodeSelection,
	$getNodeByKey as getNodeByKey,
	$isRangeSelection as isRangeSelection,
	createCommand,
	SELECTION_CHANGE_COMMAND,
	COMMAND_PRIORITY_LOW,
	CLICK_COMMAND,
	DRAGSTART_COMMAND,
	KEY_ESCAPE_COMMAND,
	KEY_ENTER_COMMAND
} from 'lexical';

import { onMount } from 'svelte';
import { mergeRegister } from '@lexical/utils';
import ImageResizer from './ImageResizer.svelte';
import { $isImageNode as isImageNode } from './ImageNode.js';
import { clearSelection, createNodeSelectionStore } from '../../nodeSelectionStore.js';
import NestedComposer from '../../NestedComposer.svelte';
import ContentEditable from '../../ContentEditable.svelte';
import RichTextPlugin from '../RichTextPlugin.svelte';
import PlaceHolder from '../PlaceHolder.svelte';
import AutoFocusPlugin from '../AutoFocusPlugin.svelte';
import { getImageHistoryPluginType, getIsEditable } from '../../composerContext.js';
import { writable } from 'svelte/store';

const imageCache = new Set();

export const RIGHT_CLICK_IMAGE_COMMAND = createCommand('RIGHT_CLICK_IMAGE_COMMAND');

export default function ImageComponent($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			src,
			altText,
			nodeKey,
			width,
			height,
			maxWidth,
			resizable,
			showCaption,
			caption,
			captionsEnabled,
			editor
		} = $$props;

		let selection = null;
		let imageRef = null;
		let buttonRef = writable(null);
		let isSelected = createNodeSelectionStore(editor, nodeKey);
		let isResizing = false;
		let activeEditorRef;
		let isEditable = getIsEditable();
		let draggable = $.derived(() => $.store_get($$store_subs ??= {}, '$isSelected', isSelected) && isNodeSelection(selection) && !isResizing);
		let isFocused = $.derived(() => ($.store_get($$store_subs ??= {}, '$isSelected', isSelected) || isResizing) && $.store_get($$store_subs ??= {}, '$isEditable', isEditable));

		let promise = new Promise((resolve, reject) => {
			if (imageCache.has(src)) {
				resolve(null);
			} else {
				const img = new Image();

				img.src = src;

				img.onload = () => {
					imageCache.add(src);
					resolve(null);
				};

				img.onerror = () => {
					reject(null);
				};
			}
		});

		const onEnter = (event) => {
			const latestSelection = getSelection();
			const buttonElem = $.store_get($$store_subs ??= {}, '$buttonRef', buttonRef);

			if ($.store_get($$store_subs ??= {}, '$isSelected', isSelected) && isNodeSelection(latestSelection) && latestSelection.getNodes().length === 1) {
				if (showCaption) {
					// Move focus into nested editor
					selection = null;

					event.preventDefault();
					caption.focus();

					return true;
				} else if (buttonElem !== null && buttonElem !== document.activeElement) {
					event.preventDefault();
					buttonElem.focus();

					return true;
				}
			}

			return false;
		};

		const onEscape = (event) => {
			if (activeEditorRef === caption || $.store_get($$store_subs ??= {}, '$buttonRef', buttonRef) === event.target) {
				selection = null;

				editor.update(() => {
					$.store_set(isSelected, true);

					const parentRootElement = editor.getRootElement();

					if (parentRootElement !== null) {
						parentRootElement.focus();
					}
				});

				return true;
			}

			return false;
		};

		const onClick = (payload) => {
			const event = payload;

			if (isResizing) {
				return true;
			}

			if (event.target === imageRef) {
				if (event.shiftKey) {
					$.store_set(isSelected, !$.store_get($$store_subs ??= {}, '$isSelected', isSelected));
				} else {
					clearSelection(editor);
					$.store_set(isSelected, true);
				}

				return true;
			}

			return false;
		};

		const onRightClick = (event) => {
			editor.getEditorState().read(() => {
				const latestSelection = getSelection();
				const domElement = event.target;

				if (domElement.tagName === 'IMG' && isRangeSelection(latestSelection) && latestSelection.getNodes().length === 1) {
					editor.dispatchCommand(RIGHT_CLICK_IMAGE_COMMAND, event);
				}
			});
		};

		onMount(() => {
			const rootElement = editor.getRootElement();

			const unregister = mergeRegister(
				editor.registerUpdateListener(({ editorState }) => {
					const updatedSelection = editorState.read(() => getSelection());

					if (isNodeSelection(updatedSelection)) {
						selection = updatedSelection;
					} else {
						selection = null;
					}
				}),
				editor.registerCommand(
					SELECTION_CHANGE_COMMAND,
					(_, activeEditor) => {
						activeEditorRef = activeEditor;

						return false;
					},
					COMMAND_PRIORITY_LOW
				),
				editor.registerCommand(CLICK_COMMAND, onClick, COMMAND_PRIORITY_LOW),
				editor.registerCommand(RIGHT_CLICK_IMAGE_COMMAND, onClick, COMMAND_PRIORITY_LOW),
				editor.registerCommand(
					DRAGSTART_COMMAND,
					(event) => {
						if (event.target === imageRef) {
							// TODO This is just a temporary workaround for FF to behave like other browsers.
							// Ideally, this handles drag & drop too (and all browsers).
							event.preventDefault();

							return true;
						}

						return false;
					},
					COMMAND_PRIORITY_LOW
				),
				editor.registerCommand(KEY_ENTER_COMMAND, onEnter, COMMAND_PRIORITY_LOW),
				editor.registerCommand(KEY_ESCAPE_COMMAND, onEscape, COMMAND_PRIORITY_LOW)
			);

			rootElement?.addEventListener('contextmenu', onRightClick);

			return () => {
				unregister();
				rootElement?.removeEventListener('contextmenu', onRightClick);
			};
		});

		const setShowCaption = () => {
			editor.update(() => {
				const node = getNodeByKey(nodeKey);

				if (isImageNode(node)) {
					node.setShowCaption(true);
				}
			});
		};

		const onResizeEnd = (nextWidth, nextHeight) => {
			// Delay hiding the resize bars for click case
			setTimeout(
				() => {
					isResizing = false;
				},
				200
			);

			editor.update(() => {
				const node = getNodeByKey(nodeKey);

				if (isImageNode(node)) {
					node.setWidthAndHeight(nextWidth, nextHeight);
				}
			});
		};

		const onResizeStart = () => {
			isResizing = true;
		};

		const historyPlugin = getImageHistoryPluginType();
		let dimensions = null;

		function isSVG(src) {
			return src.toLowerCase().endsWith('.svg');
		}

		const isSVGImage = isSVG(src);

		// Set initial dimensions for SVG images
		// Calculate final dimensions with proper scaling
		function calculateDimensions() {
			if (!isSVGImage) {
				return { height, maxWidth, width };
			}

			// Use natural dimensions if available, otherwise fallback to defaults
			const naturalWidth = dimensions?.width || 200;

			const naturalHeight = dimensions?.height || 200;
			let finalWidth = naturalWidth;
			let finalHeight = naturalHeight;

			// Scale down if width exceeds maxWidth while maintaining aspect ratio
			if (finalWidth > maxWidth) {
				const scale = maxWidth / finalWidth;

				finalWidth = maxWidth;
				finalHeight = Math.round(finalHeight * scale);
			}

			// Scale down if height exceeds maxHeight while maintaining aspect ratio
			const maxHeight = 500;

			if (finalHeight > maxHeight) {
				const scale = maxHeight / finalHeight;

				finalHeight = maxHeight;
				finalWidth = Math.round(finalWidth * scale);
			}

			return { height: finalHeight, maxWidth, width: finalWidth };
		}

		const imageStyle = $.derived(calculateDimensions);

		$$renderer.push(`<div${$.attr('draggable', draggable())}>`);

		$.await(
			$$renderer,
			promise,
			() => {
				$$renderer.push(`<p>...loading image</p>`);
			},
			(_) => {
				$$renderer.push(`<img${$.attr('src', src)}${$.attr('alt', altText)}${$.attr_style(`height:${imageStyle().height === 'inherit' ? 'inherit' : imageStyle().height + 'px'};max-width:${$.stringify(maxWidth)}px;width:${imageStyle().width === 'inherit' ? 'inherit' : imageStyle().width + 'px'};`)} draggable="false"${$.attr_class('', void 0, {
					'focused': isFocused(),
					'draggable': isFocused() && isNodeSelection(selection)
				})} onload="this.__e=event"/>`);
			}
		);

		$$renderer.push(`<!--]--></div> `);

		if (showCaption) {
			$$renderer.push(`<!--[0--><div class="image-caption-container">`);

			NestedComposer($$renderer, {
				initialEditor: caption,
				parentEditor: editor,
				children: ($$renderer) => {
					AutoFocusPlugin($$renderer, {});
					$$renderer.push(`<!----> `);

					if (historyPlugin.componentType) {
						$$renderer.push('<!--[-->');
						historyPlugin.componentType($$renderer, $.spread_props([historyPlugin.props]));
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);
					RichTextPlugin($$renderer, {});
					$$renderer.push(`<!----> `);
					ContentEditable($$renderer, { className: 'ImageNode__contentEditable' });
					$$renderer.push(`<!----> `);

					PlaceHolder($$renderer, {
						className: 'ImageNode__placeholder',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Enter image caption...`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (resizable && isNodeSelection(selection) && isFocused()) {
			$$renderer.push('<!--[0-->');

			ImageResizer($$renderer, {
				showCaption,
				setShowCaption,
				editor,
				buttonRef,
				imageRef,
				maxWidth,
				onResizeStart,
				onResizeEnd,
				captionsEnabled
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}