import * as $ from 'svelte/internal/server';
import { $patchStyleText as patchStyleText } from '@lexical/selection';

import {
	$getSelection as getSelection,
	$isRangeSelection as isRangeSelection
} from 'lexical';

import { getContext } from 'svelte';
import { getEditor, getIsEditable } from '$lib/core/composerContext.js';
import DropDown from '../generic/dropdown/DropDown.svelte';
import DropDownItem from '../generic/dropdown/DropDownItem.svelte';

export default function FontSizeDropDown($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		const FONT_SIZE_OPTIONS = [
			['10px', '10px'],
			['11px', '11px'],
			['12px', '12px'],
			['13px', '13px'],
			['14px', '14px'],
			['15px', '15px'],
			['16px', '16px'],
			['17px', '17px'],
			['18px', '18px'],
			['19px', '19px'],
			['20px', '20px']
		];

		const editor = getEditor();
		const value = getContext('fontSize');
		const style = 'font-size';
		const isEditable = getIsEditable();

		const handleClick = (option) => {
			editor.update(() => {
				const selection = getSelection();

				if (isRangeSelection(selection)) {
					patchStyleText(selection, { [style]: option });
				}
			});
		};

		const buttonAriaLabel = 'Formatting options for font size';

		DropDown($$renderer, {
			disabled: !$.store_get($$store_subs ??= {}, '$isEditable', isEditable),
			buttonClassName: 'toolbar-item ' + style,
			buttonLabel: $.store_get($$store_subs ??= {}, '$value', value),
			buttonIconClassName: '',
			buttonAriaLabel,
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(FONT_SIZE_OPTIONS);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let [option, text] = each_array[$$index];

					DropDownItem($$renderer, {
						class: `item ${$.store_get($$store_subs ??= {}, '$value', value) === option ? 'active dropdown-item-active' : ''} 'fontsize-item'`,
						onclick: () => handleClick(option),
						children: ($$renderer) => {
							$$renderer.push(`<span class="text">${$.escape(text)}</span>`);
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}