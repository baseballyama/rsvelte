import * as $ from 'svelte/internal/server';
import { registerCodeHighlighting } from '@lexical/code';
import { onMount } from 'svelte';
import { getEditor } from '../../composerContext.js';

export default function CodeHighlightPrismPlugin($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const editor = getEditor();

		onMount(() => {
			return registerCodeHighlighting(editor);
		});
	});
}