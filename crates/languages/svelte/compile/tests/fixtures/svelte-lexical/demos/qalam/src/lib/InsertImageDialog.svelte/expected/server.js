import * as $ from 'svelte/internal/server';
import { tick } from 'svelte';

import {
	CloseCircleButton,
	InsertImage,
	ModalDialog,
	getActiveEditor,
	getEditor,
	FocusEditor
} from 'svelte-lexical';

export default function InsertImageDialog($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const editor = getEditor();
		const activeEditor = getActiveEditor();
		let showModal = false;

		function open() {
			showModal = true;
		}

		let fileInputEl = void 0;
		let fileSrc = '';
		let urlSrc = '';
		let altText = '';

		// A file and a URL are mutually exclusive: choosing one disables the other
		// until it's cleared, so only one source can ever be submitted.
		let src = $.derived(() => fileSrc || urlSrc);

		let isDisabled = $.derived(() => src() === '');
		let isFileChosen = $.derived(() => fileSrc !== '');
		let isUrlEntered = $.derived(() => urlSrc !== '');
		let isLoading = false;
		let errorMessage = '';

		function loadImage(files) {
			if (!files || files.length === 0) return;

			const reader = new FileReader();

			reader.onload = () => {
				if (typeof reader.result === 'string') {
					fileSrc = reader.result;
				}
			};

			reader.readAsDataURL(files[0]);
		}

		function clearFile() {
			fileSrc = '';

			if (fileInputEl) fileInputEl.value = '';
		}

		async function closeDialog() {
			showModal = false;
			await tick();
			FocusEditor(editor);
		}

		// Fetches the remote image and re-encodes it as a base64 data URI, so that
		// images inserted via URL are stored the same way as images inserted from
		// the local file system (self-contained, no dependency on the remote URL
		// staying alive).
		function urlToBase64(url) {
			return fetch(url).then((response) => {
				if (!response.ok) {
					throw new Error(`Failed to fetch image: ${response.status}`);
				}

				return response.blob();
			}).then((blob) => new Promise((resolve, reject) => {
				const reader = new FileReader();

				reader.onload = () => {
					if (typeof reader.result === 'string') {
						resolve(reader.result);
					} else {
						reject(new Error('Failed to read image data'));
					}
				};

				reader.onerror = () => reject(reader.error);
				reader.readAsDataURL(blob);
			}));
		}

		async function confirm() {
			if (isUrlEntered()) {
				isLoading = true;
				errorMessage = '';

				try {
					const base64Src = await urlToBase64(urlSrc);

					InsertImage($.store_get($$store_subs ??= {}, '$activeEditor', activeEditor), { altText, src: base64Src });
				} catch {
					errorMessage = 'Could not load image from that URL. Please check the link and try again.';
					isLoading = false;

					return;
				}

				isLoading = false;
			} else {
				InsertImage($.store_get($$store_subs ??= {}, '$activeEditor', activeEditor), { altText, src: src() });
			}

			closeDialog();
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
					$$renderer.push(`<!----> <div class="modal svelte-1he4r45"><h2 class="Modal__title">Insert Image</h2> <div class="Modal__content"><div class="Input__wrapper"><label class="Input__label" for="qalam-image-file">Image File</label> <input id="qalam-image-file" type="file" accept="image/*" class="Input__input svelte-1he4r45"${$.attr('disabled', isUrlEntered(), true)} data-test-id="image-modal-file-upload"/> `);

					if (isFileChosen()) {
						$$renderer.push(`<!--[0--><button type="button" class="ClearFieldButton svelte-1he4r45" title="Clear file" aria-label="Clear file">×</button>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div> <div class="Input__wrapper"><label class="Input__label" for="qalam-image-url">Image URL</label> <input id="qalam-image-url" type="text" class="Input__input svelte-1he4r45" placeholder="https://source.unsplash.com/random"${$.attr('value', urlSrc)}${$.attr('disabled', isFileChosen(), true)} data-test-id="image-modal-url-input"/> `);

					if (isUrlEntered()) {
						$$renderer.push(`<!--[0--><button type="button" class="ClearFieldButton svelte-1he4r45" title="Clear URL" aria-label="Clear URL">×</button>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div> <div class="Input__wrapper"><label class="Input__label" for="qalam-image-alt">Alt Text</label> <input id="qalam-image-alt" type="text" class="Input__input svelte-1he4r45" placeholder="Descriptive alternative text"${$.attr('value', altText)} data-test-id="image-modal-alt-text-input"/></div> `);

					if (errorMessage) {
						$$renderer.push(`<!--[0--><div class="ErrorMessage svelte-1he4r45" data-test-id="image-modal-error">${$.escape(errorMessage)}</div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <div class="DialogActions"><button type="button" data-test-id="image-modal-confirm-btn"${$.attr('disabled', isDisabled() || isLoading, true)} class="Button__root">${$.escape(isLoading ? 'Loading…' : 'Confirm')}</button></div></div></div>`);
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