import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { getEditor } from '../composerContext.js';
import { FocusEditor } from '../commands/commands.js';

export default function AutoFocusPlugin($$anchor, $$props) {
	$.push($$props, true);

	const editor = getEditor();

	onMount(() => {
		FocusEditor(editor);
	});

	$.pop();
}