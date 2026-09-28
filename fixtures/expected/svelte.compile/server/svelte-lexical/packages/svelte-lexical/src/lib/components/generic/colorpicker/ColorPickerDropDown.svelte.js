import * as $ from 'svelte/internal/server';
import ColorPicker from './ColorPicker.svelte';
import DropDown from '../dropdown/DropDown.svelte';
import { getIsEditable } from '$lib/core/composerContext.js';

export default function ColorPickerDropDown($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const isEditable = getIsEditable();

		let {
			buttonClassName,
			buttonIconClassName = undefined,
			buttonAriaLabel = undefined,
			title,
			stopCloseOnClickSelf = true,
			color,
			onChange
		} = $$props;

		DropDown($$renderer, {
			buttonClassName,
			buttonIconClassName,
			buttonAriaLabel,
			title,
			disabled: !$.store_get($$store_subs ??= {}, '$isEditable', isEditable),
			stopCloseOnClickSelf,
			children: ($$renderer) => {
				ColorPicker($$renderer, { color, onChange });
			},
			$$slots: { default: true }
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}