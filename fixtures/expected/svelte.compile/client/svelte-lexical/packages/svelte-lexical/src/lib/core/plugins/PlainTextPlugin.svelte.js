import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { registerPlainText } from '@lexical/plain-text';
import { getEditor } from '../composerContext.js';

export default function PlainTextPlugin($$anchor, $$props) {
	$.push($$props, true);

	const editor = getEditor();

	// returns callback to unregister
	onMount(() => registerPlainText(editor));

	$.pop();
	// TODO: add Dragon support - registerDragonSupport(editor)
}