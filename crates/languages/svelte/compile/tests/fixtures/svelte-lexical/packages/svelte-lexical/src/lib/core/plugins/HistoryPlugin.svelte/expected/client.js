import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { createEmptyHistoryState, registerHistory } from '@lexical/history';
import { getEditor } from '../composerContext.js';

export default function HistoryPlugin($$anchor, $$props) {
	$.push($$props, true);

	const editor = getEditor();

	let externalHistoryState = $.prop($$props, 'externalHistoryState', 19, createEmptyHistoryState),
		delay = $.prop($$props, 'delay', 3, 1000);

	// returns callback to unregister
	onMount(() => registerHistory(editor, externalHistoryState(), delay()));

	$.pop();
}