import * as $ from 'svelte/internal/server';

import {
	$createParagraphNode as createParagraphNode,
	$createRangeSelection as createRangeSelection,
	$getSelection as getSelection,
	$insertNodes as insertNodes,
	$isNodeSelection as isNodeSelection,
	$isRootOrShadowRoot as isRootOrShadowRoot,
	$setSelection as setSelection,
	COMMAND_PRIORITY_EDITOR,
	COMMAND_PRIORITY_HIGH,
	COMMAND_PRIORITY_LOW,
	createCommand,
	DRAGOVER_COMMAND,
	DRAGSTART_COMMAND,
	DROP_COMMAND,
	getDOMSelectionFromTarget
} from 'lexical';

import {
	$wrapNodeInElement as wrapNodeInElement,
	isHTMLElement,
	mergeRegister
} from '@lexical/utils';

import { onMount } from 'svelte';

import {
	$createImageNode as createImageNode,
	$isImageNode as isImageNode,
	ImageNode
} from './ImageNode.js';

import { getEditor } from '../../composerContext.js';

export const INSERT_IMAGE_COMMAND = createCommand();

export default function ImagePlugin($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const editor = getEditor();
		const TRANSPARENT_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
		let img;
		let { captionsEnabled = true, children } = $$props;

		onMount(() => {
			if (!editor.hasNodes([ImageNode])) {
				throw new Error('ImagesPlugin: ImageNode not registered on editor');
			}

			img = document.createElement('img');
			img.src = TRANSPARENT_IMAGE;

			return mergeRegister(
				editor.registerCommand(
					INSERT_IMAGE_COMMAND,
					(payload) => {
						payload.captionsEnabled = captionsEnabled;

						const imageNode = createImageNode(payload);

						insertNodes([imageNode]);

						if (isRootOrShadowRoot(imageNode.getParentOrThrow())) {
							wrapNodeInElement(imageNode, createParagraphNode).selectEnd();
						}

						return true;
					},
					COMMAND_PRIORITY_EDITOR
				),
				editor.registerCommand(
					DRAGSTART_COMMAND,
					(event) => {
						return onDragStart(event);
					},
					COMMAND_PRIORITY_HIGH
				),
				editor.registerCommand(
					DRAGOVER_COMMAND,
					(event) => {
						return onDragover(event);
					},
					COMMAND_PRIORITY_LOW
				),
				editor.registerCommand(
					DROP_COMMAND,
					(event) => {
						return onDrop(event, editor);
					},
					COMMAND_PRIORITY_HIGH
				)
			);
		});

		function onDragStart(event) {
			const node = getImageNodeInSelection();

			if (!node) {
				return false;
			}

			const dataTransfer = event.dataTransfer;

			if (!dataTransfer) {
				return false;
			}

			dataTransfer.setData('text/plain', '_');
			dataTransfer.setDragImage(img, 0, 0);

			dataTransfer.setData('application/x-lexical-drag', JSON.stringify({
				data: {
					altText: node.__altText,
					caption: node.__caption,
					height: node.__height,
					key: node.getKey(),
					maxWidth: node.__maxWidth,
					showCaption: node.__showCaption,
					src: node.__src,
					width: node.__width
				},
				type: 'image'
			}));

			return true;
		}

		function onDragover(event) {
			const node = getImageNodeInSelection();

			if (!node) {
				return false;
			}

			if (!canDropImage(event)) {
				event.preventDefault();
			}

			return true;
		}

		function onDrop(event, editor) {
			const node = getImageNodeInSelection();

			if (!node) {
				return false;
			}

			const data = getDragImageData(event);

			if (!data) {
				return false;
			}

			event.preventDefault();

			if (canDropImage(event)) {
				const range = getDragSelection(event);

				node.remove();

				const rangeSelection = createRangeSelection();

				if (range !== null && range !== undefined) {
					rangeSelection.applyDOMRange(range);
				}

				setSelection(rangeSelection);
				editor.dispatchCommand(INSERT_IMAGE_COMMAND, data);
			}

			return true;
		}

		function getImageNodeInSelection() {
			const selection = getSelection();

			if (!isNodeSelection(selection)) {
				return null;
			}

			const nodes = selection.getNodes();
			const node = nodes[0];

			return isImageNode(node) ? node : null;
		}

		function getDragImageData(event) {
			const dragData = event.dataTransfer?.getData('application/x-lexical-drag');

			if (!dragData) {
				return null;
			}

			const { type, data } = JSON.parse(dragData);

			if (type !== 'image') {
				return null;
			}

			return data;
		}

		function canDropImage(event) {
			const target = event.target;

			return !!(isHTMLElement(target) && !target.closest('code, span.editor-image') && isHTMLElement(target.parentElement) && target.parentElement.closest('div.ContentEditable__root'));
		}

		function getDragSelection(event) {
			let range;
			const domSelection = getDOMSelectionFromTarget(event.target);

			if (document.caretRangeFromPoint) {
				range = document.caretRangeFromPoint(event.clientX, event.clientY);
			} else if (event.rangeParent && domSelection !== null) {
				domSelection.collapse(event.rangeParent, event.rangeOffset || 0);
				range = domSelection.getRangeAt(0);
			} else {
				throw Error(`Cannot get the selection when dragging`);
			}

			return range;
		}

		children?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}