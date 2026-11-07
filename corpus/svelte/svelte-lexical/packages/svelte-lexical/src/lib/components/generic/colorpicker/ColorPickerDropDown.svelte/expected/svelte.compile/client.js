import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ColorPicker from './ColorPicker.svelte';
import DropDown from '../dropdown/DropDown.svelte';
import { getIsEditable } from '$lib/core/composerContext.js';

export default function ColorPickerDropDown($$anchor, $$props) {
	$.push($$props, true);

	const $isEditable = () => $.store_get(isEditable, '$isEditable', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const isEditable = getIsEditable();

	let buttonIconClassName = $.prop($$props, 'buttonIconClassName', 3, undefined),
		buttonAriaLabel = $.prop($$props, 'buttonAriaLabel', 3, undefined),
		stopCloseOnClickSelf = $.prop($$props, 'stopCloseOnClickSelf', 3, true);

	{
		let $0 = $.derived(() => !$isEditable());

		DropDown($$anchor, {
			get buttonClassName() {
				return $$props.buttonClassName;
			},

			get buttonIconClassName() {
				return buttonIconClassName();
			},

			get buttonAriaLabel() {
				return buttonAriaLabel();
			},

			get title() {
				return $$props.title;
			},

			get disabled() {
				return $.get($0);
			},

			get stopCloseOnClickSelf() {
				return stopCloseOnClickSelf();
			},

			children: ($$anchor, $$slotProps) => {
				ColorPicker($$anchor, {
					get color() {
						return $$props.color;
					},

					get onChange() {
						return $$props.onChange;
					}
				});
			},
			$$slots: { default: true }
		});
	}

	$.pop();
	$$cleanup();
}