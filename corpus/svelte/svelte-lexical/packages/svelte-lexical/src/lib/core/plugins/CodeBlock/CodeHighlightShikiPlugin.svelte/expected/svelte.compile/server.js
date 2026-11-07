import * as $ from 'svelte/internal/server';
import { getEditor } from '$lib/core/composerContext.js';
import { registerCodeHighlighting } from '@lexical/code-shiki';

export default function CodeHighlightShikiPlugin($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const editor = getEditor();
	});
}