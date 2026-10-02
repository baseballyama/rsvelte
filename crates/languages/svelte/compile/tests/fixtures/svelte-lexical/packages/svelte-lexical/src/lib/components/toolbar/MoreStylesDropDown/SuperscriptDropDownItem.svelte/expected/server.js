import * as $ from 'svelte/internal/server';
import DropDownItem from '$lib/components/generic/dropdown/DropDownItem.svelte';
import { getActiveEditor } from '$lib/core/composerContext.js';
import { getContext } from 'svelte';
import { SHORTCUTS } from '../shortcuts.js';
import { toggleSuperscript } from '$lib/core/commands/commands.js';

export default function SuperscriptDropDownItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const activeEditor = getActiveEditor();
		const isSuperscript = getContext('isSuperscript');

		DropDownItem($$renderer, {
			onclick: () => {
				toggleSuperscript($.store_get($$store_subs ??= {}, '$activeEditor', activeEditor));
			},
			class: 'item wide ' + ($.store_get($$store_subs ??= {}, '$isSuperscript', isSuperscript) ? 'active dropdown-item-active' : ''),
			title: 'Superscript',
			ariaLabel: 'Format text with a superscript',
			children: ($$renderer) => {
				$$renderer.push(`<div class="icon-text-container"><i class="icon subscript"></i> <span class="text">Superscript</span></div> <span class="shortcut">${$.escape(SHORTCUTS.SUPERSCRIPT)}</span>`);
			},
			$$slots: { default: true }
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}