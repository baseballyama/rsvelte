import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DropDownItem from '$lib/components/generic/dropdown/DropDownItem.svelte';
import { getActiveEditor } from '$lib/core/composerContext.js';
import { getContext } from 'svelte';
import { SHORTCUTS } from '../shortcuts.js';
import { toggleSubscript } from '$lib/core/commands/commands.js';

var root = $.from_html(`<div class="icon-text-container"><i class="icon subscript"></i> <span class="text">Subscript</span></div> <span class="shortcut"> </span>`, 1);

export default function SubscriptDropDownItem($$anchor, $$props) {
	$.push($$props, true);

	const $activeEditor = () => $.store_get(activeEditor, '$activeEditor', $$stores);
	const $isSubscript = () => $.store_get(isSubscript, '$isSubscript', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const activeEditor = getActiveEditor();
	const isSubscript = getContext('isSubscript');

	{
		let $0 = $.derived(() => 'item wide ' + ($isSubscript() ? 'active dropdown-item-active' : ''));

		DropDownItem($$anchor, {
			onclick: () => {
				toggleSubscript($activeEditor());
			},

			get class() {
				return $.get($0);
			},
			title: 'Subscript',
			ariaLabel: 'Format text with a subscript',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var span = $.sibling($.first_child(fragment_1), 2);
				var text = $.only_child(span, true);

				$.template_effect(() => $.set_text(text, SHORTCUTS.SUBSCRIPT));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
	$$cleanup();
}