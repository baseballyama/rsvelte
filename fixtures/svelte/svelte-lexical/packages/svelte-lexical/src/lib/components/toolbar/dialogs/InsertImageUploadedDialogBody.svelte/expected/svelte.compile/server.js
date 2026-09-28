import * as $ from 'svelte/internal/server';
import { getActiveEditor } from '$lib/core/composerContext.js';
import TextInput from '../../generic/input/TextInput.svelte';
import { INSERT_IMAGE_COMMAND } from '$lib/core/plugins/Image/ImagePlugin.svelte';
import FileInput from '../../generic/input/FileInput.svelte';

export default function InsertImageUploadedDialogBody($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const activeEditor = getActiveEditor();
		let { onconfirm } = $$props;
		let src = '';
		let altText = '';
		let isDisabled = $.derived(() => src === '');

		function loadImage(files) {
			const reader = new FileReader();

			reader.onload = function () {
				if (typeof reader.result === 'string') {
					src = reader.result;
				}

				return '';
			};

			if (files !== null) {
				reader.readAsDataURL(files[0]);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="modal svelte-176zzxt"><h2 class="Modal__title">Insert Image</h2> <div class="Modal__content">`);

			FileInput($$renderer, {
				label: 'Image Upload',
				onChange: loadImage,
				accept: 'image/*',
				dataTestId: 'image-modal-file-upload'
			});

			$$renderer.push(`<!----> `);

			TextInput($$renderer, {
				label: 'Alt Text',
				placeholder: 'Descriptive alternative text',
				dataTestId: 'image-modal-alt-text-input',
				get value() {
					return altText;
				},

				set value($$value) {
					altText = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <div class="DialogActions"><button type="button" data-test-id="image-modal-file-upload-btn"${$.attr('disabled', isDisabled(), true)} class="Button__root">Confirm</button></div></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}