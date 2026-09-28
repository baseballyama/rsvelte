import * as $ from 'svelte/internal/server';
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

export default function FontSizeEntry($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let selectionFontSize = getContext('fontSize');
		let isEditable = getIsEditable();
		let activeEditor = getActiveEditor();
		let inputValue = '';
		let inputChangeFlag = false;

		function handleKeyPress(e) {
			const inputValueNumber = Number(inputValue);

			if (e.key === 'Tab') {
				return;
			}

			if (['e', 'E', '+', '-'].includes(e.key) || isNaN(inputValueNumber)) {
				e.preventDefault();
				inputValue = '';

				return;
			}

			inputChangeFlag = true;

			if (e.key === 'Enter' || e.key === 'Tab' || e.key === 'Escape') {
				e.preventDefault();
				updateFontSize($.store_get($$store_subs ??= {}, '$activeEditor', activeEditor), inputValueNumber);
			}
		}

		const handleInputBlur = () => {
			if (inputValue !== '' && inputChangeFlag) {
				const inputValueNumber = Number(inputValue);

				updateFontSize($.store_get($$store_subs ??= {}, '$activeEditor', activeEditor), inputValueNumber);
			}
		};

		$$renderer.push(`<button type="button"${$.attr('disabled', !isEditable || $.store_get($$store_subs ??= {}, '$selectionFontSize', selectionFontSize) !== '' && Number(inputValue) <= MIN_ALLOWED_FONT_SIZE, true)} aria-label="Decrease font size" class="toolbar-item sl_font-decrement"${$.attr('title', `Decrease font size (${SHORTCUTS.DECREASE_FONT_SIZE})`)}><i class="format sl_minus-icon"></i></button> <input type="number" title="Font size"${$.attr('value', inputValue)}${$.attr('disabled', !$.store_get($$store_subs ??= {}, '$isEditable', isEditable), true)} class="toolbar-item sl_font-size-input svelte-131dsfp"${$.attr('min', MIN_ALLOWED_FONT_SIZE)}${$.attr('max', MAX_ALLOWED_FONT_SIZE)}/> <button type="button"${$.attr('disabled', !isEditable || $.store_get($$store_subs ??= {}, '$selectionFontSize', selectionFontSize) !== '' && Number(inputValue) >= MAX_ALLOWED_FONT_SIZE, true)} aria-label="Increase font size" class="toolbar-item sl_font-increment"${$.attr('title', `Increase font size (${SHORTCUTS.INCREASE_FONT_SIZE})`)}><i class="format sl_add-icon"></i></button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}