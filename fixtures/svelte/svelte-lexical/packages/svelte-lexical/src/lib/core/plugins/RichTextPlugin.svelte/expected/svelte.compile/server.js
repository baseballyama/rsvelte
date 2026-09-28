import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { registerRichText } from '@lexical/rich-text';
import Decorator from '../Decorator.svelte';
import { getEditor } from '../composerContext.js';

export default function RichTextPlugin($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const editor = getEditor();

		// returns callback to unregister
		onMount(() => registerRichText(editor));

		Decorator($$renderer, {});
		// TODO: add Dragon support - registerDragonSupport(editor)
	});
}