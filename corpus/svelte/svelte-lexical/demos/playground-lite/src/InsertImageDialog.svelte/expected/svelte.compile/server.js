import * as $ from 'svelte/internal/server';
import { onMount, tick } from 'svelte';

import {
	CloseCircleButton,
	InsertImageUploadedDialogBody,
	ModalDialog,
	InsertImageUriDialogBody,
	getActiveEditor,
	getEditor,
	InsertImage,
	FocusEditor
} from 'svelte-lexical';

import landscapeImage from './images/landscape.jpg';
import yellowFlowerImage from './images/yellow-flower.jpg';

export default function InsertImageDialog($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let showModal = false;

		function open() {
			showModal = true;
		}

		let mode = null;
		let hasModifier = false;
		const editor = getEditor();
		const activeEditor = getActiveEditor();

		onMount(() => {
			hasModifier = false;

			const handler = (e) => {
				hasModifier = e.altKey;
			};

			document.addEventListener('keydown', handler);

			return () => {
				document.removeEventListener('keydown', handler);
			};
		});

		function insertAndClose(payload) {
			InsertImage($.store_get($$store_subs ??= {}, '$activeEditor', activeEditor), payload);
			closeDialog();
		}

		async function closeDialog() {
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
					CloseCircleButton($$renderer, { onclick: () => showModal = false });
					$$renderer.push(`<!----> `);

					if (!mode) {
						$$renderer.push(`<!--[0--><div class="modal svelte-rywddl"><h2 class="Modal__title">Insert Image</h2> <div class="Modal__content"><div class="ToolbarPlugin__dialogButtonsList"><button class="Button__root" data-test-id="image-modal-option-sample">Sample</button> <button class="Button__root" data-test-id="image-modal-option-url">URL</button> <button class="Button__root" data-test-id="image-modal-option-file">File</button></div></div></div>`);
					} else if (mode === 'url') {
						$$renderer.push('<!--[1-->');
						InsertImageUriDialogBody($$renderer, { onconfirm: closeDialog });
					} else if (mode === 'file') {
						$$renderer.push('<!--[2-->');
						InsertImageUploadedDialogBody($$renderer, { onconfirm: closeDialog });
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { open });
	});
}