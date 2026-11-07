import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { registerMarkdownShortcuts } from '@lexical/markdown';
import { getEditor } from '$lib/core/composerContext.js';

export default function MarkdownShortcutPlugin($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { transformers } = $$props;
		const editor = getEditor();

		onMount(() => {
			return registerMarkdownShortcuts(editor, transformers);
		});
	});
}