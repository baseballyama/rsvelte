import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { registerRichText } from '@lexical/rich-text';
import Decorator from '../Decorator.svelte';
import { getEditor } from '../composerContext.js';

export default function RichTextPlugin($$anchor, $$props) {
	$.push($$props, true);

	const editor = getEditor();

	// returns callback to unregister
	onMount(() => registerRichText(editor));

	// TODO: add Dragon support - registerDragonSupport(editor)
	Decorator($$anchor, {});

	$.pop();
}