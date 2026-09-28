import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getEditor } from '$lib/core/composerContext.js';
import { registerCodeHighlighting } from '@lexical/code-shiki';

export default function CodeHighlightShikiPlugin($$anchor, $$props) {
	$.push($$props, true);

	const editor = getEditor();

	$.user_effect(() => {
		return registerCodeHighlighting(editor);
	});

	$.pop();
}