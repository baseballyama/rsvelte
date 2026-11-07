import * as $ from 'svelte/internal/server';
import DropDownItem from '$lib/components/generic/dropdown/DropDownItem.svelte';
import { getActiveEditor } from '$lib/core/composerContext.js';
import { getContext } from 'svelte';
import { SHORTCUTS } from '../shortcuts.js';
import { toggleSubscript } from '$lib/core/commands/commands.js';

export default function SubscriptDropDownItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const activeEditor = getActiveEditor();
		const isSubscript = getContext('isSubscript');

		DropDownItem($$renderer, {
			onclick: () => {
				toggleSubscript($.store_get($$store_subs ??= {}, '$activeEditor', activeEditor));
			},
			class: 'item wide ' + ($.store_get($$store_subs ??= {}, '$isSubscript', isSubscript) ? 'active dropdown-item-active' : ''),
			title: 'Subscript',
			ariaLabel: 'Format text with a subscript',
			children: ($$renderer) => {
				$$renderer.push(`<div class="icon-text-container"><i class="icon subscript"></i> <span class="text">Subscript</span></div> <span class="shortcut">${$.escape(SHORTCUTS.SUBSCRIPT)}</span>`);
			},
			$$slots: { default: true }
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}