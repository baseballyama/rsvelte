import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEmptyHistoryState } from '@lexical/history';
import { createEditor } from 'lexical';
import { onMount, setContext } from 'svelte';
import { initializeEditor } from './initializeEditor.js';
import { createSharedEditorContext, setEditor, setHistoryStateContext } from './composerContext.js';
import { writable } from 'svelte/store';
import { initializeExtensions } from './editorExtensions.js';

export default function Composer($$anchor, $$props) {
	$.push($$props, true);

	const $isEditable = () => $.store_get(isEditable, '$isEditable', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const {
		theme,
		namespace,
		nodes,
		onError,
		editorState: initialEditorState,
		editable,
		html
	} = $$props.initialConfig;

	const editor = createEditor({
		editable,
		html,
		namespace,
		nodes,
		onError: (error) => onError(error, editor),
		theme
	});

	initializeEditor(editor, initialEditorState);
	initializeExtensions(editor);
	setEditor(editor);

	const isEditable = writable(editable !== undefined ? editable : true);

	setContext('isEditable', isEditable);

	onMount(() => {
		editor.setEditable($isEditable());

		return editor.registerEditableListener((editable) => {
			$.store_set(isEditable, editable);
		});
	});

	const historyState = createEmptyHistoryState();

	setHistoryStateContext(historyState);

	// allows sharing context between plugins and decorator nodes
	createSharedEditorContext();

	function getEditor() {
		return editor;
	}

	function getHistoryState() {
		return historyState;
	}

	var $$exports = { getEditor, getHistoryState };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}