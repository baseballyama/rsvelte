import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { getEditor } from '../composerContext.js';
import { FocusEditor } from '../commands/commands.js';

export default function AutoFocusPlugin($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const editor = getEditor();

		onMount(() => {
			FocusEditor(editor);
		});
	});
}