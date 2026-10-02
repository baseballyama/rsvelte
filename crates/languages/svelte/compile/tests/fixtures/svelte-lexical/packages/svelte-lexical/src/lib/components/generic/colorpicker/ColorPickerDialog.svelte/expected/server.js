import * as $ from 'svelte/internal/server';
import { FocusEditor } from '$lib/core/commands/commands.js';
import { getEditor } from '$lib/core/composerContext.js';
import CloseCircleButton from '../../generic/button/CloseCircleButton.svelte';
import ModalDialog from '../../generic/dialog/ModalDialog.svelte';
import ColorPicker from './ColorPicker.svelte';

export default function ColorPickerDialog($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let onChange;
		const editor = getEditor();
		let { color, title, showModal = false } = $$props;

		function open(onChangeCallback, initialColor) {
			if (initialColor) {
				color = initialColor;
			}

			onChange = onChangeCallback;
			showModal = true;
		}

		function close() {
			showModal = false;
			FocusEditor(editor);
		}

		function onColorChange(value) {
			if (onChange) {
				onChange(value, true);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ModalDialog($$renderer, {
				get showModal() {
					return showModal;
				},

				set showModal($$value) {
					showModal = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					CloseCircleButton($$renderer, { onclick: close });
					$$renderer.push(`<!----> <div class="modal"><h2 class="Modal__title">${$.escape(title)}</h2> <div class="Modal__content">`);
					ColorPicker($$renderer, { color, onChange: onColorChange });
					$$renderer.push(`<!----></div></div>`);
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { showModal, open });
	});
}