import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getEditor } from '$lib/core/composerContext.js';

import {
	registerTableCellUnmergeTransform,
	registerTablePlugin,
	registerTableSelectionObserver,
	setScrollableTablesActive,
	TableCellNode
} from '@lexical/table';

export default function TablePlugin($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * When `false` (default `true`), merged cell support (colspan and rowspan) will be disabled and all
	 * tables will be forced into a regular grid with 1x1 table cells.
	 */
	/**
	 * When `false` (default `true`), the background color of TableCellNode will always be removed.
	 */
	/**
	 * When `true` (default `true`), the tab key can be used to navigate table cells.
	 */
	/**
	 * When `true` (default `false`), tables will be wrapped in a `<div>` to enable horizontal scrolling
	 */
	/**
	 * A plugin to enable all of the features of Lexical's TableNode.
	 *
	 * @param props - See type for documentation
	 * @returns An element to render in your LexicalComposer
	 */
	let hasCellMerge = $.prop($$props, 'hasCellMerge', 3, true),
		hasCellBackgroundColor = $.prop($$props, 'hasCellBackgroundColor', 3, true),
		hasTabHandler = $.prop($$props, 'hasTabHandler', 3, true),
		hasHorizontalScroll = $.prop($$props, 'hasHorizontalScroll', 3, false);

	const editor = getEditor();

	$.user_effect(() => {
		setScrollableTablesActive(editor, hasHorizontalScroll());
	});

	$.user_effect(() => registerTablePlugin(editor));
	$.user_effect(() => registerTableSelectionObserver(editor, hasTabHandler()));

	// Unmerge cells when the feature isn't enabled
	$.user_effect(() => {
		if (!hasCellMerge()) {
			return registerTableCellUnmergeTransform(editor);
		}
	});

	// Remove cell background color when feature is disabled
	$.user_effect(() => {
		if (hasCellBackgroundColor()) {
			return;
		}

		return editor.registerNodeTransform(TableCellNode, (node) => {
			if (node.getBackgroundColor() !== null) {
				node.setBackgroundColor(null);
			}
		});
	});

	$.pop();
}