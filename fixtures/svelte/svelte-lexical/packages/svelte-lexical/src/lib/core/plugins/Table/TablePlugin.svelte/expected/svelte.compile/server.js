import * as $ from 'svelte/internal/server';
import { getEditor } from '$lib/core/composerContext.js';

import {
	registerTableCellUnmergeTransform,
	registerTablePlugin,
	registerTableSelectionObserver,
	setScrollableTablesActive,
	TableCellNode
} from '@lexical/table';

export default function TablePlugin($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
		let {
			hasCellMerge = true,
			hasCellBackgroundColor = true,
			hasTabHandler = true,
			hasHorizontalScroll = false
		} = $$props;

		const editor = getEditor();
		// Unmerge cells when the feature isn't enabled
		// Remove cell background color when feature is disabled
	});
}