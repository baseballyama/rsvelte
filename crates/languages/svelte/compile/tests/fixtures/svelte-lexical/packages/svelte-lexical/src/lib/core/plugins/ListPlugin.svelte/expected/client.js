import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { registerList } from '@lexical/list';
import { getEditor } from '../composerContext.js';

export default function ListPlugin($$anchor, $$props) {
	$.push($$props, true);

	const editor = getEditor();

	onMount(() => {
		// returns callback to unregister
		return registerList(editor);
	});

	$.pop();
}