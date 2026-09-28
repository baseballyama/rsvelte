import * as $ from 'svelte/internal/server';
import { getEditor } from '$lib/core/composerContext.js';
import DropDownItem from '../../generic/dropdown/DropDownItem.svelte';

export default function InsertColumnLayoutDropDownItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let editor = getEditor();

		DropDownItem($$renderer, {
			onclick: editor.extensions.openInsertColumnsDialog,
			class: 'item',
			children: ($$renderer) => {
				$$renderer.push(`<i class="icon columns"></i> <span class="text">Columns Layout</span>`);
			},
			$$slots: { default: true }
		});
	});
}