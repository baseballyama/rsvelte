import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CloseCircleButton from '$lib/components/generic/button/CloseCircleButton.svelte';
import ModalDialog from '$lib/components/generic/dialog/ModalDialog.svelte';
import TextInput from '$lib/components/generic/input/TextInput.svelte';
import { FocusEditor, insertBlueskyPost } from '$lib/core/commands/commands.js';
import { getEditor } from '$lib/core/composerContext.js';
import { tick } from 'svelte';

var root = $.from_html(`<!> <div class="modal svelte-168fvwl"><h2 class="Modal__title">Embed Bluesky Post</h2> <div class="Modal__content"><!> <div class="DialogActions"><button type="button" data-test-id="bluesky-embed-modal-submit-btn">Confirm</button></div></div></div>`, 1);

export default function InsertBlueskyDialog($$anchor, $$props) {
	$.push($$props, true);

	let editor = getEditor();
	let showModal = $.state(false);

	function open() {
		$.set(showModal, true);
	}

	async function close() {
		$.set(showModal, false);
		await tick();
		FocusEditor(editor);
	}

	async function insertBluesky() {
		insertBlueskyPost(editor, $.get(post));
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

	let url = $.state('');
	let post = $.derived(() => parseUrl($.get(url)));
	let isDisabled = $.derived(() => !$.get(post));

	editor.extensions.openInsertBlueskyDialog = open;

	var $$exports = {
		open,
		parseUrl,
		TID_RE,
		is_tid,
		DID_RE,
		is_did,
		HANDLE_RE,
		is_handle
	};

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

			var div = $.sibling(node, 2);
			var div_1 = $.sibling($.child(div), 2);
			var node_1 = $.child(div_1);

			TextInput(node_1, {
				label: 'Bluesky URL',
				placeholder: 'i.e. https://bsky.app/profile/syedumar.bsky.social/post/3lktvwrbcic25',
				dataTestId: 'bluesky-embed-modal-url',
				get value() {
					return $.get(url);
				},

				set value($$value) {
					$.set(url, $$value, true);
				}
			});

			var div_2 = $.sibling(node_1, 2);
			var button = $.child(div_2);
			let classes;

			$.reset(div_2);
			$.reset(div_1);
			$.reset(div);

			$.template_effect(() => {
				button.disabled = $.get(isDisabled);
				classes = $.set_class(button, 1, 'Button__root', null, classes, { Button__disabled: $.get(isDisabled) });
			});

			$.delegated('click', button, insertBluesky);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	return $.pop($$exports);
}

$.delegate(['click']);