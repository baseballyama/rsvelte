import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { getEditor } from '$lib/core/composerContext.js';
import DropDownItem from '../../generic/dropdown/DropDownItem.svelte';
import { formatBulletList } from '$lib/core/commands/commands.js';
import { SHORTCUTS } from '../shortcuts.js';

export default function BulletDropDrownItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const blockType = getContext('blockType');
		const editor = getEditor();

		DropDownItem($$renderer, {
			class: 'item wide ' + ($.store_get($$store_subs ??= {}, '$blockType', blockType) === 'bullet' ? 'active dropdown-item-active' : ''),
			onclick: () => formatBulletList(editor, $.store_get($$store_subs ??= {}, '$blockType', blockType)),
			children: ($$renderer) => {
				$$renderer.push(`<div class="icon-text-container"><i class="icon bullet-list"></i> <span class="text">Bullet List</span></div> <span class="shortcut">${$.escape(SHORTCUTS.BULLET_LIST)}</span>`);
			},
			$$slots: { default: true }
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}