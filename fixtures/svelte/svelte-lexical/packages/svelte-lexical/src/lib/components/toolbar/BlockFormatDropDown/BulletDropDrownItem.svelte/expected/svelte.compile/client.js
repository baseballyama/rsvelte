import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { getEditor } from '$lib/core/composerContext.js';
import DropDownItem from '../../generic/dropdown/DropDownItem.svelte';
import { formatBulletList } from '$lib/core/commands/commands.js';
import { SHORTCUTS } from '../shortcuts.js';

var root = $.from_html(`<div class="icon-text-container"><i class="icon bullet-list"></i> <span class="text">Bullet List</span></div> <span class="shortcut"> </span>`, 1);

export default function BulletDropDrownItem($$anchor, $$props) {
	$.push($$props, true);

	const $blockType = () => $.store_get(blockType, '$blockType', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const blockType = getContext('blockType');
	const editor = getEditor();

	{
		let $0 = $.derived(() => 'item wide ' + ($blockType() === 'bullet' ? 'active dropdown-item-active' : ''));

		DropDownItem($$anchor, {
			get class() {
				return $.get($0);
			},
			onclick: () => formatBulletList(editor, $blockType()),
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var span = $.sibling($.first_child(fragment_1), 2);
				var text = $.only_child(span, true);

				$.template_effect(() => $.set_text(text, SHORTCUTS.BULLET_LIST));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
	$$cleanup();
}