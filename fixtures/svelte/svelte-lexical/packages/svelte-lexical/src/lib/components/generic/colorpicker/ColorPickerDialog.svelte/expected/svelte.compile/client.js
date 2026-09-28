import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { FocusEditor } from '$lib/core/commands/commands.js';
import { getEditor } from '$lib/core/composerContext.js';
import CloseCircleButton from '../../generic/button/CloseCircleButton.svelte';
import ModalDialog from '../../generic/dialog/ModalDialog.svelte';
import ColorPicker from './ColorPicker.svelte';

var root = $.from_html(`<!> <div class="modal"><h2 class="Modal__title"> </h2> <div class="Modal__content"><!></div></div>`, 1);

export default function ColorPickerDialog($$anchor, $$props) {
	$.push($$props, true);

	let onChange;
	const editor = getEditor();

	let color = $.prop($$props, 'color', 7),
		showModal = $.prop($$props, 'showModal', 15, false);

	function open(onChangeCallback, initialColor) {
		if (initialColor) {
			color(initialColor);
		}

		onChange = onChangeCallback;
		showModal(true);
	}

	function close() {
		showModal(false);
		FocusEditor(editor);
	}

	function onColorChange(value) {
		if (onChange) {
			onChange(value, true);
		}
	}

	var $$exports = { open };

	ModalDialog($$anchor, {
		get showModal() {
			return showModal();
		},

		set showModal($$value) {
			showModal($$value);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			CloseCircleButton(node, { onclick: close });

			var div = $.sibling(node, 2);
			var h2 = $.child(div);
			var text = $.only_child(h2, true);
			var div_1 = $.sibling(h2, 2);
			var node_1 = $.child(div_1);

			ColorPicker(node_1, {
				get color() {
					return color();
				},
				onChange: onColorChange
			});

			$.reset(div_1);
			$.reset(div);
			$.template_effect(() => $.set_text(text, $$props.title));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	return $.pop($$exports);
}