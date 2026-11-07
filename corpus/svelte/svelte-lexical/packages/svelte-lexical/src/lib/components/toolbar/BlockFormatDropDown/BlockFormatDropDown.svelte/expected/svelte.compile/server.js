import * as $ from 'svelte/internal/server';
import { getIsEditable } from '$lib/core/composerContext.js';
import { getContext } from 'svelte';
import DropDown from '../../generic/dropdown/DropDown.svelte';
import { blockTypeToBlockName } from '../ToolbarData.js';

export default function BlockFormatDropDown($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { children } = $$props;
		const blockType = getContext('blockType');
		const isEditable = getIsEditable();

		DropDown($$renderer, {
			disabled: !$.store_get($$store_subs ??= {}, '$isEditable', isEditable),
			buttonClassName: 'toolbar-item block-controls',
			buttonIconClassName: 'icon block-type ' + $.store_get($$store_subs ??= {}, '$blockType', blockType),
			buttonLabel: blockTypeToBlockName[$.store_get($$store_subs ??= {}, '$blockType', blockType)],
			buttonAriaLabel: 'Formatting options for text style',
			children: ($$renderer) => {
				children?.($$renderer);
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}