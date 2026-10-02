import * as $ from 'svelte/internal/server';
import { HISTORY_MERGE_TAG } from 'lexical';
import { onMount } from 'svelte';
import { getEditor } from '../composerContext.js';

export default function OnChangePlugin($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ignoreHistoryMergeTagChange = true,
			ignoreSelectionChange = false,
			onChange
		} = $$props;

		const editor = getEditor();

		onMount(() => {
			if (onChange) {
				editor.registerUpdateListener((
					{
						editorState,
						dirtyElements,
						dirtyLeaves,
						prevEditorState,
						tags
					}
				) => {
					if (ignoreSelectionChange && dirtyElements.size === 0 && dirtyLeaves.size === 0 || ignoreHistoryMergeTagChange && tags.has(HISTORY_MERGE_TAG) || prevEditorState.isEmpty()) {
						return;
					}

					onChange(editorState, editor, tags);
				});
			}
		});
	});
}