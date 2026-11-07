import * as $ from 'svelte/internal/server';
import { $patchStyleText as patchStyleText } from '@lexical/selection';
import { $getSelection as getSelection } from 'lexical';
import { getContext } from 'svelte';
import { getActiveEditor, getIsEditable } from '$lib/core/composerContext.js';
import DropDown from '../generic/dropdown/DropDown.svelte';
import DropDownItem from '../generic/dropdown/DropDownItem.svelte';

export default function FontFamilyDropDown($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		const FONT_FAMILY_OPTIONS = [
			['Arial', 'Arial'],
			['Courier New', 'Courier New'],
			['Georgia', 'Georgia'],
			['Times New Roman', 'Times New Roman'],
			['Trebuchet MS', 'Trebuchet MS'],
			['Verdana', 'Verdana']
		];

		const activeEditor = getActiveEditor();
		const value = getContext('fontFamily');
		const style = 'font-family';
		const isEditable = getIsEditable();

		const handleClick = (option) => {
			$.store_get($$store_subs ??= {}, '$activeEditor', activeEditor).update(() => {
				const selection = getSelection();

				if (selection !== null) {
					patchStyleText(selection, { [style]: option });
				}
			});
		};

		const buttonAriaLabel = 'Formatting options for font family';

		DropDown($$renderer, {
			disabled: !$.store_get($$store_subs ??= {}, '$isEditable', isEditable),
			buttonClassName: 'toolbar-item ' + style,
			buttonLabel: $.store_get($$store_subs ??= {}, '$value', value),
			buttonIconClassName: 'icon block-type font-family',
			buttonAriaLabel,
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(FONT_FAMILY_OPTIONS);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let [option, text] = each_array[$$index];

					DropDownItem($$renderer, {
						class: `item ${$.store_get($$store_subs ??= {}, '$value', value) === option ? 'active dropdown-item-active' : ''}`,
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