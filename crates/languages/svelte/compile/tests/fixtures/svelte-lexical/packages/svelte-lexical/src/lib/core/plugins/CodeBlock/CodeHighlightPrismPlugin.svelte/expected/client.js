import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { registerCodeHighlighting } from '@lexical/code';
import { onMount } from 'svelte';
import { getEditor } from '../../composerContext.js';

export default function CodeHighlightPrismPlugin($$anchor, $$props) {
	$.push($$props, true);

	const editor = getEditor();

	onMount(() => {
		return registerCodeHighlighting(editor);
	});

	$.pop();
}