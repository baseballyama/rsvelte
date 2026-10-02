import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	TOGGLE_LINK_COMMAND,
	$isAutoLinkNode as isAutoLinkNode,
	$isLinkNode as isLinkNode
} from '@lexical/link';

import { $findMatchingParent as findMatchingParent, mergeRegister } from '@lexical/utils';

import {
	$getSelection as getSelection,
	$isRangeSelection as isRangeSelection,
	CLICK_COMMAND,
	COMMAND_PRIORITY_CRITICAL,
	COMMAND_PRIORITY_LOW,
	SELECTION_CHANGE_COMMAND,
	$isLineBreakNode as isLineBreakNode,
	$isNodeSelection as isNodeSelection
} from 'lexical';

import { onMount } from 'svelte';
import getSelectedNode from '../../../components/toolbar/getSelectionInfo.js';
import { getEditor } from '../../composerContext.js';
import FloatingLinkEditor from './FloatingLinkEditor.svelte';

export default function FloatingLinkEditorPlugin($$anchor, $$props) {
	$.push($$props, true);

	const editor = getEditor();
	let anchorElem = $.prop($$props, 'anchorElem', 19, () => document.body);
	let activeEditor = $.state($.proxy(editor));
	let isLink = $.state(false);
	let isEditMode = $.state(false);

	function updateToolbar() {
		const selection = getSelection();

		if (isRangeSelection(selection)) {
			const focusNode = getSelectedNode(selection);
			const focusLinkNode = findMatchingParent(focusNode, isLinkNode);
			const focusAutoLinkNode = findMatchingParent(focusNode, isAutoLinkNode);

			if (!(focusLinkNode || focusAutoLinkNode)) {
				$.set(isLink, false);

				return;
			}

			const badNode = selection.getNodes().filter((node) => !isLineBreakNode(node)).find((node) => {
				const linkNode = findMatchingParent(node, isLinkNode);
				const autoLinkNode = findMatchingParent(node, isAutoLinkNode);

				return focusLinkNode && !focusLinkNode.is(linkNode) || linkNode && !linkNode.is(focusLinkNode) || focusAutoLinkNode && !focusAutoLinkNode.is(autoLinkNode) || autoLinkNode && (!autoLinkNode.is(focusAutoLinkNode) || autoLinkNode.getIsUnlinked());
			});

			if (!badNode) {
				$.set(isLink, true);
			} else {
				$.set(isLink, false);
			}
		} else if (isNodeSelection(selection)) {
			const nodes = selection.getNodes();

			if (nodes.length === 0) {
				$.set(isLink, false);

				return;
			}

			const node = nodes[0];
			const parent = node.getParent();

			if (isLinkNode(parent) || isLinkNode(node)) {
				$.set(isLink, true);
			} else {
				$.set(isLink, false);
			}
		}
	}

	onMount(() => {
		return mergeRegister(
			editor.registerUpdateListener(({ editorState }) => {
				editorState.read(() => {
					updateToolbar();
				});
			}),
			editor.registerCommand(
				SELECTION_CHANGE_COMMAND,
				(_payload, newEditor) => {
					updateToolbar();
					$.set(activeEditor, newEditor, true);

					return false;
				},
				COMMAND_PRIORITY_CRITICAL
			),
			editor.registerCommand(
				CLICK_COMMAND,
				(payload) => {
					const selection = getSelection();

					if (isRangeSelection(selection)) {
						const node = getSelectedNode(selection);
						const linkNode = findMatchingParent(node, isLinkNode);

						if (isLinkNode(linkNode) && (payload.metaKey || payload.ctrlKey)) {
							window.open(linkNode.getURL(), '_blank');

							return true;
						}
					}

					return false;
				},
				COMMAND_PRIORITY_LOW
			),
			editor.registerCommand(
				TOGGLE_LINK_COMMAND,
				(payload) => {
					if (payload === 'https://') {
						$.set(isEditMode, true);
					}

					return false;
				},
				COMMAND_PRIORITY_CRITICAL
			)
		);
	});

	FloatingLinkEditor($$anchor, {
		get editor() {
			return $.get(activeEditor);
		},

		get isLink() {
			return $.get(isLink);
		},

		get anchorElem() {
			return anchorElem();
		},

		get isEditMode() {
			return $.get(isEditMode);
		},

		set isEditMode($$value) {
			$.set(isEditMode, $$value, true);
		}
	});

	$.pop();
}