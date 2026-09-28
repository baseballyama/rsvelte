import * as $ from 'svelte/internal/server';
import DropDownItem from '$lib/components/generic/dropdown/DropDownItem.svelte';
import { getActiveEditor } from '$lib/core/composerContext.js';
import { FORMAT_TEXT_COMMAND } from 'lexical';
import { getContext } from 'svelte';
import { SHORTCUTS } from '../shortcuts.js';

export default function StrikethroughDropDownItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const activeEditor = getActiveEditor();
		const isStrikethrough = getContext('isStrikethrough');

		DropDownItem($$renderer, {
			onclick: () => {
				$.store_get($$store_subs ??= {}, '$activeEditor', activeEditor).dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
			},
			class: 'item wide ' + ($.store_get($$store_subs ??= {}, '$isStrikethrough', isStrikethrough) ? 'active dropdown-item-active' : ''),
			title: 'Strikethrough',
			ariaLabel: 'Format text with a strikethrough',
			children: ($$renderer) => {
				$$renderer.push(`<div class="icon-text-container"><i class="icon strikethrough"></i> <span class="text">Strikethrough</span></div> <span class="shortcut">${$.escape(SHORTCUTS.STRIKETHROUGH)}</span>`);
			},
			$$slots: { default: true }
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}