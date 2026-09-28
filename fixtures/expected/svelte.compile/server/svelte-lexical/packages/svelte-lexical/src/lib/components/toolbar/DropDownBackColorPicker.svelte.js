import * as $ from 'svelte/internal/server';
import { getActiveEditor } from '$lib/core/composerContext.js';
import { getContext } from 'svelte';
import DropdownColorPicker from '../generic/colorpicker/ColorPickerDropDown.svelte';
import { $patchStyleText as patchStyleText } from '@lexical/selection';
import { $getSelection as getSelection, HISTORIC_TAG } from 'lexical';

export default function DropDownBackColorPicker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const bgColor = getContext('bgColor');
		const activeEditor = getActiveEditor();

		const onBgColorSelect = (value, skipHistoryStack) => {
			applyStyleText({ 'background-color': value }, skipHistoryStack);
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
			buttonIconClassName: 'icon bg-color',
			title: 'Background color',
			color: $.store_get($$store_subs ??= {}, '$bgColor', bgColor),
			onChange: onBgColorSelect
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}