import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getActiveEditor } from '$lib/core/composerContext.js';
import { getContext } from 'svelte';
import DropdownColorPicker from '../generic/colorpicker/ColorPickerDropDown.svelte';
import { $patchStyleText as patchStyleText } from '@lexical/selection';
import { $getSelection as getSelection, HISTORIC_TAG } from 'lexical';

export default function DropDownBackColorPicker($$anchor, $$props) {
	$.push($$props, true);

	const $activeEditor = () => $.store_get(activeEditor, '$activeEditor', $$stores);
	const $bgColor = () => $.store_get(bgColor, '$bgColor', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const bgColor = getContext('bgColor');
	const activeEditor = getActiveEditor();

	const onBgColorSelect = (value, skipHistoryStack) => {
		applyStyleText({ 'background-color': value }, skipHistoryStack);
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
		buttonIconClassName: 'icon bg-color',
		title: 'Background color',
		get color() {
			return $bgColor();
		},
		onChange: onBgColorSelect
	});

	$.pop();
	$$cleanup();
}