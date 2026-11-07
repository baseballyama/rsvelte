import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { FocusEditor } from '$lib/core/commands/commands.js';
import { getEditor } from '$lib/core/composerContext.js';
import { tick } from 'svelte';
import CloseCircleButton from '../../generic/button/CloseCircleButton.svelte';
import ModalDialog from '../../generic/dialog/ModalDialog.svelte';
import InsertImageUriDialogBody from './InsertImageUriDialogBody.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function InsertImageDialog($$anchor, $$props) {
	$.push($$props, true);

	const editor = getEditor();
	let showModal = $.state(false);

	function open() {
		$.set(showModal, true);
	}

	async function close() {
		$.set(showModal, false);
		await tick();
		FocusEditor(editor);
	}

	editor.extensions.openInsertImageDialog = open;

	var $$exports = { open };

	ModalDialog($$anchor, {
		get showModal() {
			return $.get(showModal);
		},

		set showModal($$value) {
			$.set(showModal, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			CloseCircleButton(node, { onclick: close });

			var node_1 = $.sibling(node, 2);

			InsertImageUriDialogBody(node_1, { onconfirm: close });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	return $.pop($$exports);
}