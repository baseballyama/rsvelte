import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<img draggable="false"/>`);
var root_1 = $.from_html(`<img src="/images/image-broken.svg" alt="broken link" style="height: 200px; width: 200px; opacity: 0.2;" draggable="false"/>`);
var root_2 = $.from_html(`<p>...loading image</p>`);
var root_3 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<div class="image-caption-container"><!></div>`);
var root_5 = $.from_html(`<div><!></div> <!> <!>`, 1);

export default function ImageComponent($$anchor, $$props) {
	$.push($$props, true);

	const $isSelected = () => $.store_get(isSelected, '$isSelected', $$stores);
	const $isEditable = () => $.store_get(isEditable, '$isEditable', $$stores);
	const $buttonRef = () => $.store_get(buttonRef, '$buttonRef', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let selection = $.state(null);
	let imageRef = $.state(null);
	let buttonRef = writable(null);
	let isSelected = createNodeSelectionStore($$props.editor, $$props.nodeKey);
	let isResizing = $.state(false);
	let activeEditorRef;
	let isEditable = getIsEditable();
	let draggable = $.derived(() => $isSelected() && isNodeSelection($.get(selection)) && !$.get(isResizing));
	let isFocused = $.derived(() => ($isSelected() || $.get(isResizing)) && $isEditable());

	let promise = new Promise((resolve, reject) => {
		if (imageCache.has($$props.src)) {
			resolve(null);
		} else {
			const img = new Image();

			img.src = $$props.src;

			img.onload = () => {
				imageCache.add($$props.src);
				resolve(null);
			};

			img.onerror = () => {
				reject(null);
			};
		}
	});

	const onEnter = (event) => {
		const latestSelection = getSelection();
		const buttonElem = $buttonRef();

		if ($isSelected() && isNodeSelection(latestSelection) && latestSelection.getNodes().length === 1) {
			if ($$props.showCaption) {
				// Move focus into nested editor
				$.set(selection, null);

				event.preventDefault();
				$$props.caption.focus();

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
		if (activeEditorRef === $$props.caption || $buttonRef() === event.target) {
			$.set(selection, null);

			$$props.editor.update(() => {
				$.store_set(isSelected, true);

				const parentRootElement = $$props.editor.getRootElement();

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

		if ($.get(isResizing)) {
			return true;
		}

		if (event.target === $.get(imageRef)) {
			if (event.shiftKey) {
				$.store_set(isSelected, !$isSelected());
			} else {
				clearSelection($$props.editor);
				$.store_set(isSelected, true);
			}

			return true;
		}

		return false;
	};

	const onRightClick = (event) => {
		$$props.editor.getEditorState().read(() => {
			const latestSelection = getSelection();
			const domElement = event.target;

			if (domElement.tagName === 'IMG' && isRangeSelection(latestSelection) && latestSelection.getNodes().length === 1) {
				$$props.editor.dispatchCommand(RIGHT_CLICK_IMAGE_COMMAND, event);
			}
		});
	};

	onMount(() => {
		const rootElement = $$props.editor.getRootElement();

		const unregister = mergeRegister(
			$$props.editor.registerUpdateListener(({ editorState }) => {
				const updatedSelection = editorState.read(() => getSelection());

				if (isNodeSelection(updatedSelection)) {
					$.set(selection, updatedSelection, true);
				} else {
					$.set(selection, null);
				}
			}),
			$$props.editor.registerCommand(
				SELECTION_CHANGE_COMMAND,
				(_, activeEditor) => {
					activeEditorRef = activeEditor;

					return false;
				},
				COMMAND_PRIORITY_LOW
			),
			$$props.editor.registerCommand(CLICK_COMMAND, onClick, COMMAND_PRIORITY_LOW),
			$$props.editor.registerCommand(RIGHT_CLICK_IMAGE_COMMAND, onClick, COMMAND_PRIORITY_LOW),
			$$props.editor.registerCommand(
				DRAGSTART_COMMAND,
				(event) => {
					if (event.target === $.get(imageRef)) {
						// TODO This is just a temporary workaround for FF to behave like other browsers.
						// Ideally, this handles drag & drop too (and all browsers).
						event.preventDefault();

						return true;
					}

					return false;
				},
				COMMAND_PRIORITY_LOW
			),
			$$props.editor.registerCommand(KEY_ENTER_COMMAND, onEnter, COMMAND_PRIORITY_LOW),
			$$props.editor.registerCommand(KEY_ESCAPE_COMMAND, onEscape, COMMAND_PRIORITY_LOW)
		);

		rootElement?.addEventListener('contextmenu', onRightClick);

		return () => {
			unregister();
			rootElement?.removeEventListener('contextmenu', onRightClick);
		};
	});

	const setShowCaption = () => {
		$$props.editor.update(() => {
			const node = getNodeByKey($$props.nodeKey);

			if (isImageNode(node)) {
				node.setShowCaption(true);
			}
		});
	};

	const onResizeEnd = (nextWidth, nextHeight) => {
		// Delay hiding the resize bars for click case
		setTimeout(
			() => {
				$.set(isResizing, false);
			},
			200
		);

		$$props.editor.update(() => {
			const node = getNodeByKey($$props.nodeKey);

			if (isImageNode(node)) {
				node.setWidthAndHeight(nextWidth, nextHeight);
			}
		});
	};

	const onResizeStart = () => {
		$.set(isResizing, true);
	};

	const historyPlugin = getImageHistoryPluginType();
	let dimensions = $.state(null);

	function isSVG(src) {
		return src.toLowerCase().endsWith('.svg');
	}

	const isSVGImage = isSVG($$props.src);

	// Set initial dimensions for SVG images
	$.user_effect(() => {
		if ($.get(imageRef) && isSVGImage) {
			const { naturalWidth, naturalHeight } = $.get(imageRef);

			$.set(dimensions, { height: naturalHeight, width: naturalWidth }, true);
		}
	});

	// Calculate final dimensions with proper scaling
	function calculateDimensions() {
		if (!isSVGImage) {
			return {
				height: $$props.height,
				maxWidth: $$props.maxWidth,
				width: $$props.width
			};
		}

		// Use natural dimensions if available, otherwise fallback to defaults
		const naturalWidth = $.get(dimensions)?.width || 200;

		const naturalHeight = $.get(dimensions)?.height || 200;
		let finalWidth = naturalWidth;
		let finalHeight = naturalHeight;

		// Scale down if width exceeds maxWidth while maintaining aspect ratio
		if (finalWidth > $$props.maxWidth) {
			const scale = $$props.maxWidth / finalWidth;

			finalWidth = $$props.maxWidth;
			finalHeight = Math.round(finalHeight * scale);
		}

		// Scale down if height exceeds maxHeight while maintaining aspect ratio
		const maxHeight = 500;

		if (finalHeight > maxHeight) {
			const scale = maxHeight / finalHeight;

			finalHeight = maxHeight;
			finalWidth = Math.round(finalWidth * scale);
		}

		return {
			height: finalHeight,
			maxWidth: $$props.maxWidth,
			width: finalWidth
		};
	}

	const imageStyle = $.derived(calculateDimensions);
	var fragment = root_5();
	var div = $.first_child(fragment);
	var node_1 = $.child(div);

	$.await(
		node_1,
		() => promise,
		($$anchor) => {
			var p = root_2();

			$.append($$anchor, p);
		},
		($$anchor, _) => {
			var img_1 = root();
			let classes;

			$.bind_this(img_1, ($$value) => $.set(imageRef, $$value), () => $.get(imageRef));

			$.template_effect(
				($0) => {
					$.set_attribute(img_1, 'src', $$props.src);
					$.set_attribute(img_1, 'alt', $$props.altText);
					$.set_style(img_1, `height:${$.get(imageStyle).height === 'inherit' ? 'inherit' : $.get(imageStyle).height + 'px'};max-width:${$$props.maxWidth ?? ''}px;width:${$.get(imageStyle).width === 'inherit' ? 'inherit' : $.get(imageStyle).width + 'px'};`);
					classes = $.set_class(img_1, 1, '', null, classes, { focused: $.get(isFocused), draggable: $0 });
				},
				[() => $.get(isFocused) && isNodeSelection($.get(selection))]
			);

			$.event('load', img_1, (e) => {
				if (isSVGImage) {
					const img = e.currentTarget;

					$.set(dimensions, { height: img.naturalHeight, width: img.naturalWidth }, true);
				}
			});

			$.replay_events(img_1);
			$.append($$anchor, img_1);
		},
		($$anchor, _) => {
			var img_2 = root_1();

			$.append($$anchor, img_2);
		}
	);

	$.reset(div);

	var node_2 = $.sibling(div, 2);

	{
		var consequent = ($$anchor) => {
			var div_1 = root_4();
			var node_3 = $.child(div_1);

			NestedComposer(node_3, {
				get initialEditor() {
					return $$props.caption;
				},

				get parentEditor() {
					return $$props.editor;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_3();
					var node_4 = $.first_child(fragment_1);

					AutoFocusPlugin(node_4, {});

					var node_5 = $.sibling(node_4, 2);

					$.component(node_5, () => historyPlugin.componentType, ($$anchor, historyPlugin_componentType) => {
						historyPlugin_componentType($$anchor, $.spread_props(() => historyPlugin.props));
					});

					var node_6 = $.sibling(node_5, 2);

					RichTextPlugin(node_6, {});

					var node_7 = $.sibling(node_6, 2);

					ContentEditable(node_7, { className: 'ImageNode__contentEditable' });

					var node_8 = $.sibling(node_7, 2);

					PlaceHolder(node_8, {
						className: 'ImageNode__placeholder',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Enter image caption...');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node_2, ($$render) => {
			if ($$props.showCaption) $$render(consequent);
		});
	}

	var node_9 = $.sibling(node_2, 2);

	{
		var consequent_1 = ($$anchor) => {
			ImageResizer($$anchor, {
				get showCaption() {
					return $$props.showCaption;
				},
				setShowCaption,
				get editor() {
					return $$props.editor;
				},

				get buttonRef() {
					return buttonRef;
				},

				get imageRef() {
					return $.get(imageRef);
				},

				get maxWidth() {
					return $$props.maxWidth;
				},
				onResizeStart,
				onResizeEnd,
				get captionsEnabled() {
					return $$props.captionsEnabled;
				}
			});
		};

		var d = $.derived(() => $$props.resizable && isNodeSelection($.get(selection)) && $.get(isFocused));

		$.if(node_9, ($$render) => {
			if ($.get(d)) $$render(consequent_1);
		});
	}

	$.template_effect(() => $.set_attribute(div, 'draggable', $.get(draggable)));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}