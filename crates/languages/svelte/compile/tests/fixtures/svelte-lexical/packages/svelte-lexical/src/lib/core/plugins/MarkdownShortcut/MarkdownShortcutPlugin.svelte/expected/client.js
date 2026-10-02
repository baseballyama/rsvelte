import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { registerMarkdownShortcuts } from '@lexical/markdown';
import { getEditor } from '$lib/core/composerContext.js';

export default function MarkdownShortcutPlugin($$anchor, $$props) {
	$.push($$props, true);

	const editor = getEditor();

	onMount(() => {
		return registerMarkdownShortcuts(editor, $$props.transformers);
	});

	$.pop();
}