import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { registerPlainText } from '@lexical/plain-text';
import { getEditor } from '../composerContext.js';

export default function PlainTextPlugin($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const editor = getEditor();

		// returns callback to unregister
		onMount(() => registerPlainText(editor));

		// TODO: add Dragon support - registerDragonSupport(editor)
	});
}