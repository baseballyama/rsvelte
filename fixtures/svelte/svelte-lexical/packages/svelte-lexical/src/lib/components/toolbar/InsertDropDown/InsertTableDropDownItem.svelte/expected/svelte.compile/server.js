import * as $ from 'svelte/internal/server';
import { getEditor } from '$lib/core/composerContext.js';
import DropDownItem from '../../generic/dropdown/DropDownItem.svelte';

export default function InsertTableDropDownItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const editor = getEditor();

		DropDownItem($$renderer, {
			onclick: editor.extensions.openInsertTableDialog,
			class: 'item',
			children: ($$renderer) => {
				$$renderer.push(`<i class="icon table"></i> <span class="text">Table</span>`);
			},
			$$slots: { default: true }
		});
	});
}