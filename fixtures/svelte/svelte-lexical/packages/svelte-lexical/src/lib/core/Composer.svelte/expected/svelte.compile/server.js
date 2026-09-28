import * as $ from 'svelte/internal/server';
import { createEmptyHistoryState } from '@lexical/history';
import { createEditor } from 'lexical';
import { onMount, setContext } from 'svelte';
import { initializeEditor } from './initializeEditor.js';
import { createSharedEditorContext, setEditor, setHistoryStateContext } from './composerContext.js';
import { writable } from 'svelte/store';
import { initializeExtensions } from './editorExtensions.js';

export default function Composer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { initialConfig, children } = $$props;

		const {
			theme,
			namespace,
			nodes,
			onError,
			editorState: initialEditorState,
			editable,
			html
		} = initialConfig;

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
			editor.setEditable($.store_get($$store_subs ??= {}, '$isEditable', isEditable));

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

		children?.($$renderer);
		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { getEditor, getHistoryState });
	});
}