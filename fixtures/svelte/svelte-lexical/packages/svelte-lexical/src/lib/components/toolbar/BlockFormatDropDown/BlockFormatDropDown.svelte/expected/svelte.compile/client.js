import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getIsEditable } from '$lib/core/composerContext.js';
import { getContext } from 'svelte';
import DropDown from '../../generic/dropdown/DropDown.svelte';
import { blockTypeToBlockName } from '../ToolbarData.js';

export default function BlockFormatDropDown($$anchor, $$props) {
	$.push($$props, true);

	const $isEditable = () => $.store_get(isEditable, '$isEditable', $$stores);
	const $blockType = () => $.store_get(blockType, '$blockType', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const blockType = getContext('blockType');
	const isEditable = getIsEditable();

	{
		let $0 = $.derived(() => !$isEditable());
		let $1 = $.derived(() => 'icon block-type ' + $blockType());

		DropDown($$anchor, {
			get disabled() {
				return $.get($0);
			},
			buttonClassName: 'toolbar-item block-controls',
			get buttonIconClassName() {
				return $.get($1);
			},

			get buttonLabel() {
				return blockTypeToBlockName[$blockType()];
			},
			buttonAriaLabel: 'Formatting options for text style',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.snippet(node, () => $$props.children ?? $.noop);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
	$$cleanup();
}