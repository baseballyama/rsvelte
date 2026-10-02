import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CloseCircleButton from '$lib/components/generic/button/CloseCircleButton.svelte';
import ModalDialog from '$lib/components/generic/dialog/ModalDialog.svelte';
import TextInput from '$lib/components/generic/input/TextInput.svelte';
import { FocusEditor, insertYoutube } from '$lib/core/commands/commands.js';
import { getEditor } from '$lib/core/composerContext.js';
import { tick } from 'svelte';

var root = $.from_html(`<!> <div class="modal svelte-s77q3h"><h2 class="Modal__title">Embed Youtube Video</h2> <div class="Modal__content"><!> <div class="DialogActions"><button type="button" data-test-id="youtube-video-embed-modal-submit-btn">Confirm</button></div></div></div>`, 1);

export default function InsertYoutubeDialog($$anchor, $$props) {
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

	async function insertVideo() {
		insertYoutube(editor, $.get(id));
		close();
	}

	// determine if a given URL is a match and return video id.
	function parseUrl(url) {
		const match = (/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/).exec(url);

		return match ? match?.[2].length === 11 ? match[2] : null : null;
	}

	editor.extensions.openInsertYoutubeDialog = open;

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
				label: 'YouTube URL',
				placeholder: 'i.e. https://www.youtube.com/watch?v=VIDEO_ID',
				dataTestId: 'youtube-video-embed-modal-url',
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

			$.delegated('click', button, insertVideo);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	return $.pop($$exports);
}

$.delegate(['click']);