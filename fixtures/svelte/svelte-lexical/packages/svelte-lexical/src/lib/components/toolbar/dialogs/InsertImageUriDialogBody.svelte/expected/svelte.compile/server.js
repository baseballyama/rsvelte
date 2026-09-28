import * as $ from 'svelte/internal/server';
import { getActiveEditor } from '$lib/core/composerContext.js';
import { INSERT_IMAGE_COMMAND } from '$lib/core/plugins/Image/ImagePlugin.svelte';
import TextInput from '../../generic/input/TextInput.svelte';

export default function InsertImageUriDialogBody($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const activeEditor = getActiveEditor();
		let { onconfirm } = $$props;
		let src = '';
		let altText = '';
		let isDisabled = $.derived(() => src === '');
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="modal svelte-19n1zc7"><h2 class="Modal__title">Insert Image</h2> <div class="Modal__content">`);

			TextInput($$renderer, {
				label: 'Image URL',
				placeholder: 'i.e. https://source.unsplash.com/random',
				dataTestId: 'image-modal-url-input',
				id: 'lexical-modal-image-url',
				get value() {
					return src;
				},

				set value($$value) {
					src = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			TextInput($$renderer, {
				label: 'Alt Text',
				placeholder: 'Random unsplash image',
				dataTestId: 'image-modal-alt-text-input',
				id: 'lexical-modal-image-alttext',
				get value() {
					return altText;
				},

				set value($$value) {
					altText = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <div class="DialogActions"><button type="button" data-test-id="image-modal-confirm-btn"${$.attr('disabled', isDisabled(), true)} class="Button__root">Confirm</button></div></div></div>`);
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