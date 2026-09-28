import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DropDownItem from '$lib/components/generic/dropdown/DropDownItem.svelte';
import { getActiveEditor } from '$lib/core/composerContext.js';
import { getContext } from 'svelte';
import { SHORTCUTS } from '../shortcuts.js';
import { toggleSuperscript } from '$lib/core/commands/commands.js';

var root = $.from_html(`<div class="icon-text-container"><i class="icon subscript"></i> <span class="text">Superscript</span></div> <span class="shortcut"> </span>`, 1);

export default function SuperscriptDropDownItem($$anchor, $$props) {
	$.push($$props, true);

	const $activeEditor = () => $.store_get(activeEditor, '$activeEditor', $$stores);
	const $isSuperscript = () => $.store_get(isSuperscript, '$isSuperscript', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const activeEditor = getActiveEditor();
	const isSuperscript = getContext('isSuperscript');

	{
		let $0 = $.derived(() => 'item wide ' + ($isSuperscript() ? 'active dropdown-item-active' : ''));

		DropDownItem($$anchor, {
			onclick: () => {
				toggleSuperscript($activeEditor());
			},

			get class() {
				return $.get($0);
			},
			title: 'Superscript',
			ariaLabel: 'Format text with a superscript',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var span = $.sibling($.first_child(fragment_1), 2);
				var text = $.only_child(span, true);

				$.template_effect(() => $.set_text(text, SHORTCUTS.SUPERSCRIPT));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
	$$cleanup();
}