import * as $ from 'svelte/internal/server';
import CloseCircleButton from '$lib/components/generic/button/CloseCircleButton.svelte';
import ModalDialog from '$lib/components/generic/dialog/ModalDialog.svelte';
import TextInput from '$lib/components/generic/input/TextInput.svelte';
import { FocusEditor, insertBlueskyPost } from '$lib/core/commands/commands.js';
import { getEditor } from '$lib/core/composerContext.js';
import { tick } from 'svelte';

export default function InsertBlueskyDialog($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		async function insertBluesky() {
			insertBlueskyPost(editor, post());
			close();
		}

		// determine if a given URL is a match and return bluesky profile and post key.
		const parseUrl = (str) => {
			const url = safe_parse_url(str);

			if (!url) {
				return null;
			}

			let match;

			if (url.host === 'bsky.app' || url.host === 'staging.bsky.app' || url.host === 'main.bsky.dev') {
				if (match = (/^\/profile\/([^/]+)\/post\/([^/]+)\/?$/).exec(url.pathname)) {
					if (!is_at_identifier(match[1]) || !is_tid(match[2])) {
						return null;
					}

					return { profile: match[1], postKey: match[2] };
				}
			}

			return null;
		};

		const safe_parse_url = (str) => {
			let url;

			if ('parse' in URL) {
				url = URL.parse(str);
			} else {
				try {
					// @ts-expect-error: `'parse' in URL` is giving truthy
					url = new URL(str);
				} catch {
					url = null;
				}
			}

			if (url && (url.protocol === 'https:' || url.protocol === 'http:')) {
				return url;
			}

			return null;
		};

		const TID_RE = /^[234567abcdefghij][234567abcdefghijklmnopqrstuvwxyz]{12}$/;

		const is_tid = (str) => {
			return str.length === 13 && TID_RE.test(str);
		};

		const DID_RE = /^did:([a-z]+):([a-zA-Z0-9._:%-]*[a-zA-Z0-9._-])$/;

		const is_did = (str) => {
			return str.length >= 7 && str.length <= 2048 && DID_RE.test(str);
		};

		const HANDLE_RE = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;

		const is_handle = (str) => {
			return str.length >= 3 && str.length <= 253 && HANDLE_RE.test(str);
		};

		const is_at_identifier = (str) => {
			return is_did(str) || is_handle(str);
		};

		let url = '';
		let post = $.derived(() => parseUrl(url));
		let isDisabled = $.derived(() => !post());

		editor.extensions.openInsertBlueskyDialog = open;

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
					$$renderer.push(`<!----> <div class="modal svelte-168fvwl"><h2 class="Modal__title">Embed Bluesky Post</h2> <div class="Modal__content">`);

					TextInput($$renderer, {
						label: 'Bluesky URL',
						placeholder: 'i.e. https://bsky.app/profile/syedumar.bsky.social/post/3lktvwrbcic25',
						dataTestId: 'bluesky-embed-modal-url',
						get value() {
							return url;
						},

						set value($$value) {
							url = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> <div class="DialogActions"><button type="button" data-test-id="bluesky-embed-modal-submit-btn"${$.attr('disabled', isDisabled(), true)}${$.attr_class('Button__root', void 0, { 'Button__disabled': isDisabled() })}>Confirm</button></div></div></div>`);
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

		$.bind_props($$props, {
			open,
			parseUrl,
			TID_RE,
			is_tid,
			DID_RE,
			is_did,
			HANDLE_RE,
			is_handle
		});
	});
}