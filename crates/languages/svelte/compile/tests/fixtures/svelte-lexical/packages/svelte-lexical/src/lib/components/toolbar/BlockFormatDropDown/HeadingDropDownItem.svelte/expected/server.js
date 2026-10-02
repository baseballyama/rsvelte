import * as $ from 'svelte/internal/server';
import DropDownItem from '../../generic/dropdown/DropDownItem.svelte';
import { getContext } from 'svelte';
import { getEditor } from '$lib/core/composerContext.js';
import { formatHeading } from '$lib/core/commands/commands.js';
import { SHORTCUTS } from '../shortcuts.js';

export default function HeadingDropDownItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { headingSize } = $$props;
		const blockType = getContext('blockType');
		const editor = getEditor();

		DropDownItem($$renderer, {
			class: 'item wide ' + ($.store_get($$store_subs ??= {}, '$blockType', blockType) === headingSize ? 'active dropdown-item-active' : ''),
			onclick: () => formatHeading(editor, $.store_get($$store_subs ??= {}, '$blockType', blockType), headingSize),
			children: ($$renderer) => {
				$$renderer.push(`<div class="icon-text-container"><i${$.attr_class(`icon ${$.stringify(headingSize)}`)}></i> <span class="text">Heading ${$.escape(headingSize.charAt(1))}</span></div> <span class="shortcut">${$.escape(SHORTCUTS[`HEADING${headingSize.charAt(1)}`])}</span>`);
			},
			$$slots: { default: true }
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}