import * as $ from 'svelte/internal/server';
import CloseCircleButton from '$lib/components/generic/button/CloseCircleButton.svelte';
import ModalDialog from '$lib/components/generic/dialog/ModalDialog.svelte';
import TextInput from '$lib/components/generic/input/TextInput.svelte';
import { FocusEditor, insertTweet } from '$lib/core/commands/commands.js';
import { getEditor } from '$lib/core/composerContext.js';
import { tick } from 'svelte';

export default function InsertTweetDialog($$renderer, $$props) {
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

		async function onSubmit() {
			insertTweet(editor, id());
			close();
		}

		// determine if a given URL is a match and return tweet id.
		function parseUrl(url) {
			const match = (/^https:\/\/(twitter|x)\.com\/(#!\/)?(\w+)\/status(es)*\/(\d+)/).exec(url);

			if (match != null) {
				return match[5];
			}

			return null;
		}

		editor.extensions.openInsertTweetDialog = open;

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
					$$renderer.push(`<!----> <div class="modal svelte-15n62ux"><h2 class="Modal__title">Embed Tweet</h2> <div class="Modal__content">`);

					TextInput($$renderer, {
						label: 'Tweet URL',
						placeholder: 'i.e. https://x.com/umaranis/status/1904831197710000491',
						dataTestId: 'tweet-embed-modal-url',
						get value() {
							return url;
						},

						set value($$value) {
							url = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> <div class="DialogActions"><button type="button" data-test-id="tweet-embed-modal-submit-btn"${$.attr('disabled', isDisabled(), true)}${$.attr_class('Button__root', void 0, { 'Button__disabled': isDisabled() })}>Confirm</button></div></div></div>`);
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