import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { $patchStyleText as patchStyleText } from '@lexical/selection';

import {
	$getSelection as getSelection,
	$isRangeSelection as isRangeSelection
} from 'lexical';

import { getContext } from 'svelte';
import { getEditor, getIsEditable } from '$lib/core/composerContext.js';
import DropDown from '../generic/dropdown/DropDown.svelte';
import DropDownItem from '../generic/dropdown/DropDownItem.svelte';

var root = $.from_html(`<span class="text"> </span>`);

export default function FontSizeDropDown($$anchor, $$props) {
	$.push($$props, true);

	const $isEditable = () => $.store_get(isEditable, '$isEditable', $$stores);
	const $value = () => $.store_get(value, '$value', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

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

	{
		let $0 = $.derived(() => !$isEditable());

		DropDown($$anchor, {
			get disabled() {
				return $.get($0);
			},
			buttonClassName: 'toolbar-item ' + style,
			get buttonLabel() {
				return $value();
			},
			buttonIconClassName: '',
			buttonAriaLabel,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.each(node, 17, () => FONT_SIZE_OPTIONS, $.index, ($$anchor, $$item) => {
					var $$array = $.derived(() => $.to_array($.get($$item), 2));
					let option = () => $.get($$array)[0];
					let text = () => $.get($$array)[1];

					{
						let $0 = $.derived(() => `item ${$value() === option() ? 'active dropdown-item-active' : ''} 'fontsize-item'`);

						DropDownItem($$anchor, {
							get class() {
								return $.get($0);
							},
							onclick: () => handleClick(option()),
							children: ($$anchor, $$slotProps) => {
								var span = root();
								var text_1 = $.only_child(span, true);

								$.template_effect(() => $.set_text(text_1, text()));
								$.append($$anchor, span);
							},
							$$slots: { default: true }
						});
					}
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
	$$cleanup();
}