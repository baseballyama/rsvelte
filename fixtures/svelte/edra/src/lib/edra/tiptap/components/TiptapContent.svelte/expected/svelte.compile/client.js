import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getEditor } from './editorContext.js';
import EditorContent from './EditorContent.svelte';

export default function TiptapContent($$anchor, $$props) {
	$.push($$props, true);

	const editor = getEditor();

	EditorContent($$anchor, {
		get editor() {
			return editor;
		},

		get class() {
			return $$props.class;
		}
	});

	$.pop();
}