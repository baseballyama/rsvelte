import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getActiveEditor } from '$lib/core/composerContext.js';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '$lib/core/plugins/HorizontalRuleNode.js';
import DropDownItem from '../../generic/dropdown/DropDownItem.svelte';

var root = $.from_html(`<i class="icon horizontal-rule"></i> <span class="text">Horizontal Rule</span>`, 1);

export default function InsertHRDropDownItem($$anchor, $$props) {
	$.push($$props, true);

	const $activeEditor = () => $.store_get(activeEditor, '$activeEditor', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const activeEditor = getActiveEditor();

	DropDownItem($$anchor, {
		onclick: () => {
			$activeEditor().dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
		},
		class: 'item',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
	$$cleanup();
}