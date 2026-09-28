import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import DropDownItem from '../../generic/dropdown/DropDownItem.svelte';
import { getEditor } from '$lib/core/composerContext.js';
import { formatParagraph } from '$lib/core/commands/commands.js';
import { SHORTCUTS } from '../shortcuts.js';

export default function ParagraphDropDownItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const blockType = getContext('blockType');
		const editor = getEditor();

		DropDownItem($$renderer, {
			class: 'item wide ' + ($.store_get($$store_subs ??= {}, '$blockType', blockType) === 'paragraph' ? 'active dropdown-item-active' : ''),
			onclick: () => formatParagraph(editor),
			children: ($$renderer) => {
				$$renderer.push(`<div class="icon-text-container"><i class="icon paragraph"></i> <span class="text">Normal</span></div> <span class="shortcut">${$.escape(SHORTCUTS.NORMAL)}</span>`);
			},
			$$slots: { default: true }
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}