import * as $ from 'svelte/internal/server';
import { getActiveEditor } from '$lib/core/composerContext.js';
import { getContext } from 'svelte';
import DropdownColorPicker from '../generic/colorpicker/ColorPickerDropDown.svelte';
import { $patchStyleText as patchStyleText } from '@lexical/selection';
import { $getSelection as getSelection, HISTORIC_TAG } from 'lexical';

export default function DropDownTextColorPicker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const fontColor = getContext('fontColor');
		const activeEditor = getActiveEditor();

		const onFontColorSelect = (value, skipHistoryStack) => {
			applyStyleText({ color: value }, skipHistoryStack);
		};

		const applyStyleText = (styles, skipHistoryStack) => {
			$.store_get($$store_subs ??= {}, '$activeEditor', activeEditor).update(
				() => {
					const selection = getSelection();

					if (selection !== null) {
						patchStyleText(selection, styles);
					}
				},
				skipHistoryStack ? { tag: HISTORIC_TAG } : {}
			);
		};

		DropdownColorPicker($$renderer, {
			buttonClassName: 'toolbar-item color-picker',
			buttonIconClassName: 'icon font-color',
			buttonAriaLabel: 'Formatting text color',
			title: 'Text color',
			color: $.store_get($$store_subs ??= {}, '$fontColor', fontColor),
			onChange: onFontColorSelect
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}