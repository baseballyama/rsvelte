import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DropDownItem from '$lib/components/generic/dropdown/DropDownItem.svelte';
import { getActiveEditor } from '$lib/core/composerContext.js';
import { FORMAT_TEXT_COMMAND } from 'lexical';
import { getContext } from 'svelte';
import { SHORTCUTS } from '../shortcuts.js';

var root = $.from_html(`<div class="icon-text-container"><i class="icon strikethrough"></i> <span class="text">Strikethrough</span></div> <span class="shortcut"> </span>`, 1);

export default function StrikethroughDropDownItem($$anchor, $$props) {
	$.push($$props, true);

	const $activeEditor = () => $.store_get(activeEditor, '$activeEditor', $$stores);
	const $isStrikethrough = () => $.store_get(isStrikethrough, '$isStrikethrough', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const activeEditor = getActiveEditor();
	const isStrikethrough = getContext('isStrikethrough');

	{
		let $0 = $.derived(() => 'item wide ' + ($isStrikethrough() ? 'active dropdown-item-active' : ''));

		DropDownItem($$anchor, {
			onclick: () => {
				$activeEditor().dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
			},

			get class() {
				return $.get($0);
			},
			title: 'Strikethrough',
			ariaLabel: 'Format text with a strikethrough',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var span = $.sibling($.first_child(fragment_1), 2);
				var text = $.only_child(span, true);

				$.template_effect(() => $.set_text(text, SHORTCUTS.STRIKETHROUGH));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
	$$cleanup();
}