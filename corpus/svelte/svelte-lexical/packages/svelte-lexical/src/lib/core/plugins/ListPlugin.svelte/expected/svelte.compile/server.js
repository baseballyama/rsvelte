import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { registerList } from '@lexical/list';
import { getEditor } from '../composerContext.js';

export default function ListPlugin($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const editor = getEditor();

		onMount(() => {
			// returns callback to unregister
			return registerList(editor);
		});
	});
}