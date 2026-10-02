import * as $ from 'svelte/internal/server';
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

export default function BlockWithAlignableContents($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { children, format, nodeKey, className } = $$props;
		const editor = getEditor();
		let isSelected = createNodeSelectionStore(editor, nodeKey);
		let ref;

		$$renderer.push(`<div${$.attr_class($.clsx([
			className.base,
			$.store_get($$store_subs ??= {}, '$isSelected', isSelected) ? className.focus : null
		].filter(Boolean).join(' ')))}${$.attr_style(`text-align: ${format ? format : ''};`)}>`);

		children($$renderer);
		$$renderer.push(`<!----></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}