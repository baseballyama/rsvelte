import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { $isDecoratorBlockNode as isDecoratorBlockNode } from './DecoratorBlockNode.js';

import {
	$getNearestBlockElementAncestorOrThrow as getNearestBlockElementAncestorOrThrow,
	mergeRegister
} from '@lexical/utils';

import {
	$getNodeByKey as getNodeByKey,
	$getSelection as getSelection,
	$isNodeSelection as isNodeSelection,
	$isRangeSelection as isRangeSelection,
	CLICK_COMMAND,
	COMMAND_PRIORITY_LOW,
	FORMAT_ELEMENT_COMMAND
} from 'lexical';

import { getEditor } from '../composerContext.js';
import { clearSelection, createNodeSelectionStore } from '../nodeSelectionStore.js';

var root = $.from_html(`<div><!></div>`);

export default function BlockWithAlignableContents($$anchor, $$props) {
	$.push($$props, true);

	const $isSelected = () => $.store_get(isSelected, '$isSelected', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const editor = getEditor();
	let isSelected = createNodeSelectionStore(editor, $$props.nodeKey);
	let ref;

	$.user_effect(() => {
		return mergeRegister(
			editor.registerCommand(
				FORMAT_ELEMENT_COMMAND,
				(formatType) => {
					if ($isSelected()) {
						const selection = getSelection();

						if (isNodeSelection(selection)) {
							const node = getNodeByKey($$props.nodeKey);

							if (isDecoratorBlockNode(node)) {
								node.setFormat(formatType);
							}
						} else if (isRangeSelection(selection)) {
							const nodes = selection.getNodes();

							for (const node of nodes) {
								if (isDecoratorBlockNode(node)) {
									node.setFormat(formatType);
								} else {
									const element = getNearestBlockElementAncestorOrThrow(node);

									element.setFormat(formatType);
								}
							}
						}

						return true;
					}

					return false;
				},
				COMMAND_PRIORITY_LOW
			),
			editor.registerCommand(
				CLICK_COMMAND,
				(event) => {
					if (event.target === ref) {
						event.preventDefault();

						if (!event.shiftKey) {
							clearSelection(editor);
						}

						$.store_set(isSelected, !$isSelected());

						return true;
					}

					return false;
				},
				COMMAND_PRIORITY_LOW
			)
		);
	});

	var div = root();
	var node_1 = $.child(div);

	$.snippet(node_1, () => $$props.children);
	$.reset(div);
	$.bind_this(div, ($$value) => ref = $$value, () => ref);

	$.template_effect(
		($0) => {
			$.set_class(div, 1, $0);
			$.set_style(div, `text-align: ${$$props.format ? $$props.format : ''};`);
		},
		[
			() => $.clsx([
				$$props.className.base,
				$isSelected() ? $$props.className.focus : null
			].filter(Boolean).join(' '))
		]
	);

	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}