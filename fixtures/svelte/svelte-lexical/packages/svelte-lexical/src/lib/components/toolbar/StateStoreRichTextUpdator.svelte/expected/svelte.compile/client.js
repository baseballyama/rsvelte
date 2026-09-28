import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	$getSelection as getSelection,
	$isRangeSelection as isRangeSelection,
	$isNodeSelection as isNodeSelection,
	$isRootOrShadowRoot as isRootOrShadowRoot,
	COMMAND_PRIORITY_CRITICAL,
	SELECTION_CHANGE_COMMAND
} from 'lexical';

import {
	$isParentElementRTL as isParentElementRTL,
	$getSelectionStyleValueForProperty as getSelectionStyleValueForProperty
} from '@lexical/selection';

import { $isHeadingNode as isHeadingNode } from '@lexical/rich-text';
import { ListNode, $isListNode as isListNode } from '@lexical/list';

import {
	$findMatchingParent as findMatchingParent,
	$getNearestNodeOfType as getNearestNodeOfType,
	mergeRegister,
	$isEditorIsNestedEditor as isEditorIsNestedEditor
} from '@lexical/utils';

import { getContext, onMount } from 'svelte';
import { $isCodeNode as isCodeNode, CODE_LANGUAGE_MAP } from '@lexical/code';
import { getActiveEditor, getEditor } from '$lib/core/composerContext.js';
import getSelectedNode from './getSelectionInfo.js';
import { $isLinkNode as isLinkNode } from '@lexical/link';
import { blockTypeToBlockName } from './ToolbarData.js';
import { $isTableSelection as isTableSelection } from '@lexical/table';

export default function StateStoreRichTextUpdator($$anchor, $$props) {
	$.push($$props, true);

	const $blockType = () => $.store_get(blockType, '$blockType', $$stores);
	const $codeLanguage = () => $.store_get(codeLanguage, '$codeLanguage', $$stores);
	const $codeTheme = () => $.store_get(codeTheme, '$codeTheme', $$stores);
	const $activeEditor = () => $.store_get(activeEditor, '$activeEditor', $$stores);
	const $isImageCaption = () => $.store_get(isImageCaption, '$isImageCaption', $$stores);
	const $isRTL = () => $.store_get(isRTL, '$isRTL', $$stores);
	const $isLink = () => $.store_get(isLink, '$isLink', $$stores);
	const $selectedElementKey = () => $.store_get(selectedElementKey, '$selectedElementKey', $$stores);
	const $fontColor = () => $.store_get(fontColor, '$fontColor', $$stores);
	const $bgColor = () => $.store_get(bgColor, '$bgColor', $$stores);
	const $fontFamily = () => $.store_get(fontFamily, '$fontFamily', $$stores);
	const $isBold = () => $.store_get(isBold, '$isBold', $$stores);
	const $isItalic = () => $.store_get(isItalic, '$isItalic', $$stores);
	const $isUnderline = () => $.store_get(isUnderline, '$isUnderline', $$stores);
	const $isStrikethrough = () => $.store_get(isStrikethrough, '$isStrikethrough', $$stores);
	const $isSubscript = () => $.store_get(isSubscript, '$isSubscript', $$stores);
	const $isSuperscript = () => $.store_get(isSuperscript, '$isSuperscript', $$stores);
	const $isCode = () => $.store_get(isCode, '$isCode', $$stores);
	const $fontSize = () => $.store_get(fontSize, '$fontSize', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const editor = getEditor();
	const activeEditor = getActiveEditor();
	const isBold = getContext('isBold');
	const isItalic = getContext('isItalic');
	const isUnderline = getContext('isUnderline');
	const isStrikethrough = getContext('isStrikethrough');
	const isSubscript = getContext('isSubscript');
	const isSuperscript = getContext('isSuperscript');
	const isCode = getContext('isCode');
	const blockType = getContext('blockType');
	const selectedElementKey = getContext('selectedElementKey');
	const isRTL = getContext('isRTL');
	const codeLanguage = getContext('codeLanguage');
	const codeTheme = getContext('codeTheme');
	const fontSize = getContext('fontSize');
	const fontFamily = getContext('fontFamily');
	const fontColor = getContext('fontColor');
	const bgColor = getContext('bgColor');
	const isLink = getContext('isLink');
	const isImageCaption = getContext('isImageCaption');

	function findTopLevelElement(node) {
		let topLevelElement = node.getKey() === 'root'
			? node
			: findMatchingParent(node, (e) => {
				const parent = e.getParent();

				return parent !== null && isRootOrShadowRoot(parent);
			});

		if (topLevelElement === null) {
			topLevelElement = node.getTopLevelElementOrThrow();
		}

		return topLevelElement;
	}

	function handleHeadingNode(selectedElement) {
		const type = isHeadingNode(selectedElement) ? selectedElement.getTag() : selectedElement.getType();

		if (type in blockTypeToBlockName) {
			$.store_set(blockType, type);
		}
	}

	function handleCodeNode(element) {
		if (isCodeNode(element)) {
			const language = element.getLanguage();

			$.store_set(codeLanguage, language ? CODE_LANGUAGE_MAP[language] || language : '');

			const theme = element.getTheme();

			$.store_set(codeTheme, theme || '');

			return;
		}
	}

	const updateToolbar = () => {
		const selection = getSelection();

		if (isRangeSelection(selection)) {
			if ($activeEditor() !== editor && isEditorIsNestedEditor($activeEditor())) {
				const rootElement = $activeEditor().getRootElement();

				$.store_set(isImageCaption, !!rootElement?.parentElement?.classList.contains('image-caption-container'));
			} else {
				$.store_set(isImageCaption, false);
			}

			const anchorNode = selection.anchor.getNode();
			const element = findTopLevelElement(anchorNode);
			const elementKey = element.getKey();
			const elementDOM = $activeEditor().getElementByKey(elementKey);

			$.store_set(isRTL, isParentElementRTL(selection));

			// Update links
			const node = getSelectedNode(selection);

			const parent = node.getParent();

			if (isLinkNode(parent) || isLinkNode(node)) {
				$.store_set(isLink, true);
			} else {
				$.store_set(isLink, false);
			}

			if (elementDOM !== null) {
				$.store_set(selectedElementKey, elementKey);

				if (isListNode(element)) {
					const parentList = getNearestNodeOfType(anchorNode, ListNode);
					const type = parentList ? parentList.getListType() : element.getListType();

					$.store_set(blockType, type);
				} else {
					handleHeadingNode(element);
					handleCodeNode(element);
				}
			}

			// Hande buttons
			$.store_set(fontColor, getSelectionStyleValueForProperty(selection, 'color', '#000'));

			$.store_set(bgColor, getSelectionStyleValueForProperty(selection, 'background-color', '#fff'));
			$.store_set(fontFamily, getSelectionStyleValueForProperty(selection, 'font-family', 'Arial'));
		}

		//TODO: create a separate toolbar updator that doesn't suppprt tables (doesn't use isTableSelection) and save on package size
		if (isRangeSelection(selection) || isTableSelection(selection)) {
			// Update text format
			$.store_set(isBold, selection.hasFormat('bold'));

			$.store_set(isItalic, selection.hasFormat('italic'));
			$.store_set(isUnderline, selection.hasFormat('underline'));
			$.store_set(isStrikethrough, selection.hasFormat('strikethrough'));
			$.store_set(isSubscript, selection.hasFormat('subscript'));
			$.store_set(isSuperscript, selection.hasFormat('superscript'));
			$.store_set(isCode, selection.hasFormat('code'));
			$.store_set(fontSize, getSelectionStyleValueForProperty(selection, 'font-size', '15px'));
		}

		if (isNodeSelection(selection)) {
			const nodes = selection.getNodes();

			for (const selectedNode of nodes) {
				const parentList = getNearestNodeOfType(selectedNode, ListNode);

				if (parentList) {
					const type = parentList.getListType();

					$.store_set(blockType, type);
				} else {
					const selectedElement = findTopLevelElement(selectedNode);

					handleHeadingNode(selectedElement);
					handleCodeNode(selectedElement);
				}
			}
		}
	};

	// unregisters onDestory using returned callback
	onMount(() => {
		return mergeRegister(
			editor.registerUpdateListener(({ editorState }) => {
				editorState.read(
					() => {
						updateToolbar();
					},
					{ editor }
				);
			}),
			editor.registerCommand(
				SELECTION_CHANGE_COMMAND,
				(_payload, newEditor) => {
					$.store_set(activeEditor, newEditor);
					updateToolbar();

					return false;
				},
				COMMAND_PRIORITY_CRITICAL
			)
		);
	});

	$.pop();
	$$cleanup();
}