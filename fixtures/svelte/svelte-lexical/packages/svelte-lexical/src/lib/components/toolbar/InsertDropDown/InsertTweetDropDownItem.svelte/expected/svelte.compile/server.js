import * as $ from 'svelte/internal/server';
import { getEditor } from '$lib/core/composerContext.js';
import DropDownItem from '../../generic/dropdown/DropDownItem.svelte';

export default function InsertTweetDropDownItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const editor = getEditor();

		DropDownItem($$renderer, {
			onclick: editor.extensions.openInsertTweetDialog,
			class: 'item',
			children: ($$renderer) => {
				$$renderer.push(`<i class="icon x"></i> <span class="text">X (Tweet)</span>`);
			},
			$$slots: { default: true }
		});
	});
}