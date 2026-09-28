import * as $ from 'svelte/internal/server';
import { registerCheckList } from '@lexical/list';
import { onMount } from 'svelte';
import { getEditor } from '../composerContext.js';

export default function CheckListPlugin($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const editor = getEditor();

		onMount(() => {
			return registerCheckList(editor);
		});
	});
}