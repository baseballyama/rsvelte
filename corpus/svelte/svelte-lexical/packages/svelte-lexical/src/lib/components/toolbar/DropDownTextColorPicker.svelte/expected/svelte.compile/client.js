import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getActiveEditor } from '$lib/core/composerContext.js';
import { getContext } from 'svelte';
import DropdownColorPicker from '../generic/colorpicker/ColorPickerDropDown.svelte';
import { $patchStyleText as patchStyleText } from '@lexical/selection';
import { $getSelection as getSelection, HISTORIC_TAG } from 'lexical';

export default function DropDownTextColorPicker($$anchor, $$props) {
	$.push($$props, true);

	const $activeEditor = () => $.store_get(activeEditor, '$activeEditor', $$stores);
	const $fontColor = () => $.store_get(fontColor, '$fontColor', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const fontColor = getContext('fontColor');
	const activeEditor = getActiveEditor();

	const onFontColorSelect = (value, skipHistoryStack) => {
		applyStyleText({ color: value }, skipHistoryStack);
	};

	const applyStyleText = (styles, skipHistoryStack) => {
		$activeEditor().update(
			() => {
				const selection = getSelection();

				if (selection !== null) {
					patchStyleText(selection, styles);
				}
			},
			skipHistoryStack ? { tag: HISTORIC_TAG } : {}
		);
	};

	DropdownColorPicker($$anchor, {
		buttonClassName: 'toolbar-item color-picker',
		buttonIconClassName: 'icon font-color',
		buttonAriaLabel: 'Formatting text color',
		title: 'Text color',
		get color() {
			return $fontColor();
		},
		onChange: onFontColorSelect
	});

	$.pop();
	$$cleanup();
}