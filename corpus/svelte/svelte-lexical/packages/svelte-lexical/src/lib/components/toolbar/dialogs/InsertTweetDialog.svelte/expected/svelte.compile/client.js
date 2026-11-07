import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CloseCircleButton from '$lib/components/generic/button/CloseCircleButton.svelte';
import ModalDialog from '$lib/components/generic/dialog/ModalDialog.svelte';
import TextInput from '$lib/components/generic/input/TextInput.svelte';
import { FocusEditor, insertTweet } from '$lib/core/commands/commands.js';
import { getEditor } from '$lib/core/composerContext.js';
import { tick } from 'svelte';

var root = $.from_html(`<!> <div class="modal svelte-15n62ux"><h2 class="Modal__title">Embed Tweet</h2> <div class="Modal__content"><!> <div class="DialogActions"><button type="button" data-test-id="tweet-embed-modal-submit-btn">Confirm</button></div></div></div>`, 1);

export default function InsertTweetDialog($$anchor, $$props) {
	$.push($$props, true);

	let url = $.state('');
	let id = $.derived(() => parseUrl($.get(url)));
	let isDisabled = $.derived(() => !$.get(id));
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

	async function onSubmit() {
		insertTweet(editor, $.get(id));
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

			var div = $.sibling(node, 2);
			var div_1 = $.sibling($.child(div), 2);
			var node_1 = $.child(div_1);

			TextInput(node_1, {
				label: 'Tweet URL',
				placeholder: 'i.e. https://x.com/umaranis/status/1904831197710000491',
				dataTestId: 'tweet-embed-modal-url',
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

			$.delegated('click', button, onSubmit);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	return $.pop($$exports);
}

$.delegate(['click']);