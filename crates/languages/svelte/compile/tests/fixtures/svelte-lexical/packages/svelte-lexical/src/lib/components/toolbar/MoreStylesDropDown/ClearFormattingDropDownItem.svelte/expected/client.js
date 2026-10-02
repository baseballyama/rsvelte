import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DropDownItem from '$lib/components/generic/dropdown/DropDownItem.svelte';
import { clearFormatting } from '$lib/core/commands/commands.js';
import { getActiveEditor } from '$lib/core/composerContext.js';
import { SHORTCUTS } from '../shortcuts.js';

var root = $.from_html(`<div class="icon-text-container"><i class="icon clear"></i> <span class="text">Clear formatting</span></div> <span class="shortcut"> </span>`, 1);

export default function ClearFormattingDropDownItem($$anchor, $$props) {
	$.push($$props, true);

	const $activeEditor = () => $.store_get(activeEditor, '$activeEditor', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const activeEditor = getActiveEditor();

	DropDownItem($$anchor, {
		onclick: () => clearFormatting($activeEditor()),
		class: 'item wide ',
		title: 'Clear text formatting',
		ariaLabel: 'Clear all text formatting',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var span = $.sibling($.first_child(fragment_1), 2);
			var text = $.only_child(span, true);

			$.template_effect(() => $.set_text(text, SHORTCUTS.CLEAR_FORMATTING));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
	$$cleanup();
}