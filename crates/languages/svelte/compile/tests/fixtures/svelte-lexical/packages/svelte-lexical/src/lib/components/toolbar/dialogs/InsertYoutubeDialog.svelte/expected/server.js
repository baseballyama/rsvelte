import * as $ from 'svelte/internal/server';
import CloseCircleButton from '$lib/components/generic/button/CloseCircleButton.svelte';
import ModalDialog from '$lib/components/generic/dialog/ModalDialog.svelte';
import TextInput from '$lib/components/generic/input/TextInput.svelte';
import { FocusEditor, insertYoutube } from '$lib/core/commands/commands.js';
import { getEditor } from '$lib/core/composerContext.js';
import { tick } from 'svelte';

export default function InsertYoutubeDialog($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let url = '';
		let id = $.derived(() => parseUrl(url));
		let isDisabled = $.derived(() => !id());
		let editor = getEditor();
		let showModal = false;

		function open() {
			showModal = true;
		}

		async function close() {
			showModal = false;
			await tick();
			FocusEditor(editor);
		}

		async function insertVideo() {
			insertYoutube(editor, id());
			close();
		}

		// determine if a given URL is a match and return video id.
		function parseUrl(url) {
			const match = (/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/).exec(url);

			return match ? match?.[2].length === 11 ? match[2] : null : null;
		}

		editor.extensions.openInsertYoutubeDialog = open;

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
					$$renderer.push(`<!----> <div class="modal svelte-s77q3h"><h2 class="Modal__title">Embed Youtube Video</h2> <div class="Modal__content">`);

					TextInput($$renderer, {
						label: 'YouTube URL',
						placeholder: 'i.e. https://www.youtube.com/watch?v=VIDEO_ID',
						dataTestId: 'youtube-video-embed-modal-url',
						get value() {
							return url;
						},

						set value($$value) {
							url = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> <div class="DialogActions"><button type="button" data-test-id="youtube-video-embed-modal-submit-btn"${$.attr('disabled', isDisabled(), true)}${$.attr_class('Button__root', void 0, { 'Button__disabled': isDisabled() })}>Confirm</button></div></div></div>`);
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