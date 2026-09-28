import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { registerCheckList } from '@lexical/list';
import { onMount } from 'svelte';
import { getEditor } from '../composerContext.js';

export default function CheckListPlugin($$anchor, $$props) {
	$.push($$props, true);

	const editor = getEditor();

	onMount(() => {
		return registerCheckList(editor);
	});

	$.pop();
}