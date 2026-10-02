import * as $ from 'svelte/internal/server';
import { getEditor } from './editorContext.js';
import EditorContent from './EditorContent.svelte';

export default function TiptapContent($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className } = $$props;
		const editor = getEditor();

		EditorContent($$renderer, { editor, class: className });
	});
}