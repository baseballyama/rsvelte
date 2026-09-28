import * as $ from 'svelte/internal/server';
import { FocusEditor } from '$lib/core/commands/commands.js';
import { getEditor } from '$lib/core/composerContext.js';
import { tick } from 'svelte';
import CloseCircleButton from '../../generic/button/CloseCircleButton.svelte';
import ModalDialog from '../../generic/dialog/ModalDialog.svelte';
import InsertImageUriDialogBody from './InsertImageUriDialogBody.svelte';

export default function InsertImageDialog($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const editor = getEditor();
		let showModal = false;

		function open() {
			showModal = true;
		}

		async function close() {
			showModal = false;
			await tick();
			FocusEditor(editor);
		}

		editor.extensions.openInsertImageDialog = open;

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
					$$renderer.push(`<!----> `);
					InsertImageUriDialogBody($$renderer, { onconfirm: close });
					$$renderer.push(`<!---->`);
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
		$.bind_props($$props, { open });
	});
}