import * as $ from 'svelte/internal/server';
import DropDownItem from '$lib/components/generic/dropdown/DropDownItem.svelte';
import { clearFormatting } from '$lib/core/commands/commands.js';
import { getActiveEditor } from '$lib/core/composerContext.js';
import { SHORTCUTS } from '../shortcuts.js';

export default function ClearFormattingDropDownItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const activeEditor = getActiveEditor();

		DropDownItem($$renderer, {
			onclick: () => clearFormatting($.store_get($$store_subs ??= {}, '$activeEditor', activeEditor)),
			class: 'item wide ',
			title: 'Clear text formatting',
			ariaLabel: 'Clear all text formatting',
			children: ($$renderer) => {
				$$renderer.push(`<div class="icon-text-container"><i class="icon clear"></i> <span class="text">Clear formatting</span></div> <span class="shortcut">${$.escape(SHORTCUTS.CLEAR_FORMATTING)}</span>`);
			},
			$$slots: { default: true }
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}