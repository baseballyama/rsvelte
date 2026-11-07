import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { HISTORY_MERGE_TAG } from 'lexical';
import { onMount } from 'svelte';
import { getEditor } from '../composerContext.js';

export default function OnChangePlugin($$anchor, $$props) {
	$.push($$props, true);

	let ignoreHistoryMergeTagChange = $.prop($$props, 'ignoreHistoryMergeTagChange', 3, true),
		ignoreSelectionChange = $.prop($$props, 'ignoreSelectionChange', 3, false);

	const editor = getEditor();

	onMount(() => {
		if ($$props.onChange) {
			editor.registerUpdateListener((
				{
					editorState,
					dirtyElements,
					dirtyLeaves,
					prevEditorState,
					tags
				}
			) => {
				if (ignoreSelectionChange() && dirtyElements.size === 0 && dirtyLeaves.size === 0 || ignoreHistoryMergeTagChange() && tags.has(HISTORY_MERGE_TAG) || prevEditorState.isEmpty()) {
					return;
				}

				$$props.onChange(editorState, editor, tags);
			});
		}
	});

	$.pop();
}