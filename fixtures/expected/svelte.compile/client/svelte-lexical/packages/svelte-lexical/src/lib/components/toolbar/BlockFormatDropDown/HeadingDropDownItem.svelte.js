import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DropDownItem from '../../generic/dropdown/DropDownItem.svelte';
import { getContext } from 'svelte';
import { getEditor } from '$lib/core/composerContext.js';
import { formatHeading } from '$lib/core/commands/commands.js';
import { SHORTCUTS } from '../shortcuts.js';

var root = $.from_html(`<div class="icon-text-container"><i></i> <span class="text"> </span></div> <span class="shortcut"> </span>`, 1);

export default function HeadingDropDownItem($$anchor, $$props) {
	$.push($$props, true);

	const $blockType = () => $.store_get(blockType, '$blockType', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const blockType = getContext('blockType');
	const editor = getEditor();

	{
		let $0 = $.derived(() => 'item wide ' + ($blockType() === $$props.headingSize ? 'active dropdown-item-active' : ''));

		DropDownItem($$anchor, {
			get class() {
				return $.get($0);
			},
			onclick: () => formatHeading(editor, $blockType(), $$props.headingSize),
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var div = $.first_child(fragment_1);
				var i = $.child(div);
				var span = $.sibling(i, 2);
				var text = $.only_child(span);

				$.reset(div);

				var span_1 = $.sibling(div, 2);
				var text_1 = $.only_child(span_1, true);

				$.template_effect(
					($0, $1) => {
						$.set_class(i, 1, `icon ${$$props.headingSize ?? ''}`);
						$.set_text(text, `Heading ${$0 ?? ''}`);
						$.set_text(text_1, $1);
					},
					[
						() => $$props.headingSize.charAt(1),
						() => SHORTCUTS[`HEADING${$$props.headingSize.charAt(1)}`]
					]
				);

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
	$$cleanup();
}