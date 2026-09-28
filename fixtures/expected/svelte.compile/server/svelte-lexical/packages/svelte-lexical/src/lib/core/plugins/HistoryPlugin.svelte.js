import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { createEmptyHistoryState, registerHistory } from '@lexical/history';
import { getEditor } from '../composerContext.js';

export default function HistoryPlugin($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const editor = getEditor();

		let {
			externalHistoryState = createEmptyHistoryState(),
			delay = 1000
		} = $$props;

		// returns callback to unregister
		onMount(() => registerHistory(editor, externalHistoryState, delay));
	});
}