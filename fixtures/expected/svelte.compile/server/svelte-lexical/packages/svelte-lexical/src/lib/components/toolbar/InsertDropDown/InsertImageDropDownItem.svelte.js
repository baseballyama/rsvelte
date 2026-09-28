import * as $ from 'svelte/internal/server';
import DropDownItem from '../../generic/dropdown/DropDownItem.svelte';
import { getEditor } from '$lib/core/composerContext.js';

export default function InsertImageDropDownItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const editor = getEditor();

		DropDownItem($$renderer, {
			onclick: editor.extensions.openInsertImageDialog,
			class: 'item',
			children: ($$renderer) => {
				$$renderer.push(`<i class="icon image"></i> <span class="text">Image</span>`);
			},
			$$slots: { default: true }
		});
	});
}