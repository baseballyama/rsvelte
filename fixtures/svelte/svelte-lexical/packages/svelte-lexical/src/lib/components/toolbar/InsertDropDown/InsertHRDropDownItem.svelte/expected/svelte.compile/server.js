import * as $ from 'svelte/internal/server';
import { getActiveEditor } from '$lib/core/composerContext.js';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '$lib/core/plugins/HorizontalRuleNode.js';
import DropDownItem from '../../generic/dropdown/DropDownItem.svelte';

export default function InsertHRDropDownItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const activeEditor = getActiveEditor();

		DropDownItem($$renderer, {
			onclick: () => {
				$.store_get($$store_subs ??= {}, '$activeEditor', activeEditor).dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
			},
			class: 'item',
			children: ($$renderer) => {
				$$renderer.push(`<i class="icon horizontal-rule"></i> <span class="text">Horizontal Rule</span>`);
			},
			$$slots: { default: true }
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}