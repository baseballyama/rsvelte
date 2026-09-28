import * as $ from 'svelte/internal/server';
import { getEditor } from '$lib/core/composerContext.js';
import DropDownItem from '../../generic/dropdown/DropDownItem.svelte';

export default function InsertYoutubeDropDownItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const editor = getEditor();

		DropDownItem($$renderer, {
			onclick: editor.extensions.openInsertYoutubeDialog,
			class: 'item',
			children: ($$renderer) => {
				$$renderer.push(`<i class="icon youtube"></i> <span class="text">Youtube Video</span>`);
			},
			$$slots: { default: true }
		});
	});
}