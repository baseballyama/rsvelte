import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getActiveEditor, getIsEditable } from '$lib/core/composerContext.js';
import { getContext } from 'svelte';

import {
	decreaseFontSize,
	increaseFontSize,
	MAX_ALLOWED_FONT_SIZE,
	MIN_ALLOWED_FONT_SIZE,
	updateFontSize
} from '$lib/core/commands/updateFontSize.js';

import { SHORTCUTS } from './shortcuts.js';

var root = $.from_html(`<button type="button" aria-label="Decrease font size" class="toolbar-item sl_font-decrement"><i class="format sl_minus-icon"></i></button> <input type="number" title="Font size" class="toolbar-item sl_font-size-input svelte-131dsfp"/> <button type="button" aria-label="Increase font size" class="toolbar-item sl_font-increment"><i class="format sl_add-icon"></i></button>`, 1);

export default function FontSizeEntry($$anchor, $$props) {
	$.push($$props, true);

	const $selectionFontSize = () => $.store_get(selectionFontSize, '$selectionFontSize', $$stores);
	const $activeEditor = () => $.store_get(activeEditor, '$activeEditor', $$stores);
	const $isEditable = () => $.store_get(isEditable, '$isEditable', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let selectionFontSize = getContext('fontSize');
	let isEditable = getIsEditable();
	let activeEditor = getActiveEditor();
	let inputValue = $.state('');

	$.user_effect(() => {
		$.set(inputValue, $selectionFontSize().slice(0, -2), true);
	});

	let inputChangeFlag = false;

	function handleKeyPress(e) {
		const inputValueNumber = Number($.get(inputValue));

		if (e.key === 'Tab') {
			return;
		}

		if (['e', 'E', '+', '-'].includes(e.key) || isNaN(inputValueNumber)) {
			e.preventDefault();
			$.set(inputValue, '');

			return;
		}

		inputChangeFlag = true;

		if (e.key === 'Enter' || e.key === 'Tab' || e.key === 'Escape') {
			e.preventDefault();
			updateFontSize($activeEditor(), inputValueNumber);
		}
	}

	const handleInputBlur = () => {
		if ($.get(inputValue) !== '' && inputChangeFlag) {
			const inputValueNumber = Number($.get(inputValue));

			updateFontSize($activeEditor(), inputValueNumber);
		}
	};

	var fragment = root();
	var button = $.first_child(fragment);
	var input = $.sibling(button, 2);

	$.remove_input_defaults(input);

	var button_1 = $.sibling(input, 2);

	$.template_effect(
		($0, $1) => {
			button.disabled = $0;
			$.set_attribute(button, 'title', `Decrease font size (${SHORTCUTS.DECREASE_FONT_SIZE})`);
			input.disabled = !$isEditable();
			$.set_attribute(input, 'min', MIN_ALLOWED_FONT_SIZE);
			$.set_attribute(input, 'max', MAX_ALLOWED_FONT_SIZE);
			button_1.disabled = $1;
			$.set_attribute(button_1, 'title', `Increase font size (${SHORTCUTS.INCREASE_FONT_SIZE})`);
		},
		[
			() => !isEditable || $selectionFontSize() !== '' && Number($.get(inputValue)) <= MIN_ALLOWED_FONT_SIZE,
			() => !isEditable || $selectionFontSize() !== '' && Number($.get(inputValue)) >= MAX_ALLOWED_FONT_SIZE
		]
	);

	$.delegated('click', button, () => decreaseFontSize($activeEditor(), Number($.get(inputValue))));
	$.delegated('keydown', input, handleKeyPress);
	$.event('blur', input, handleInputBlur);
	$.bind_value(input, () => $.get(inputValue), ($$value) => $.set(inputValue, $$value));
	$.delegated('click', button_1, () => increaseFontSize($activeEditor(), Number($.get(inputValue))));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['click', 'keydown']);