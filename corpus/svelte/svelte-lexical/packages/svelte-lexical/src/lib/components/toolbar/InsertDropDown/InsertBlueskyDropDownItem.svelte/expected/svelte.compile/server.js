import * as $ from 'svelte/internal/server';
import { getEditor } from '$lib/core/composerContext.js';
import DropDownItem from '../../generic/dropdown/DropDownItem.svelte';

export default function InsertBlueskyDropDownItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const editor = getEditor();

		DropDownItem($$renderer, {
			onclick: editor.extensions.openInsertBlueskyDialog,
			class: 'item',
			children: ($$renderer) => {
				$$renderer.push(`<i class="icon bluesky"></i> <span class="text">Bluesky Post</span>`);
			},
			$$slots: { default: true }
		});
	});
}