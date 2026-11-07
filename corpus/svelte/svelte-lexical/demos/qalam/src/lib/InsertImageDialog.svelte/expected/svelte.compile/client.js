import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tick } from 'svelte';

import {
	CloseCircleButton,
	InsertImage,
	ModalDialog,
	getActiveEditor,
	getEditor,
	FocusEditor
} from 'svelte-lexical';

var root = $.from_html(`<button type="button" class="ClearFieldButton svelte-1he4r45" title="Clear file" aria-label="Clear file">×</button>`);
var root_1 = $.from_html(`<button type="button" class="ClearFieldButton svelte-1he4r45" title="Clear URL" aria-label="Clear URL">×</button>`);
var root_2 = $.from_html(`<div class="ErrorMessage svelte-1he4r45" data-test-id="image-modal-error"> </div>`);
var root_3 = $.from_html(`<!> <div class="modal svelte-1he4r45"><h2 class="Modal__title">Insert Image</h2> <div class="Modal__content"><div class="Input__wrapper"><label class="Input__label" for="qalam-image-file">Image File</label> <input id="qalam-image-file" type="file" accept="image/*" class="Input__input svelte-1he4r45" data-test-id="image-modal-file-upload"/> <!></div> <div class="Input__wrapper"><label class="Input__label" for="qalam-image-url">Image URL</label> <input id="qalam-image-url" type="text" class="Input__input svelte-1he4r45" placeholder="https://source.unsplash.com/random" data-test-id="image-modal-url-input"/> <!></div> <div class="Input__wrapper"><label class="Input__label" for="qalam-image-alt">Alt Text</label> <input id="qalam-image-alt" type="text" class="Input__input svelte-1he4r45" placeholder="Descriptive alternative text" data-test-id="image-modal-alt-text-input"/></div> <!> <div class="DialogActions"><button type="button" data-test-id="image-modal-confirm-btn" class="Button__root"> </button></div></div></div>`, 1);

export default function InsertImageDialog($$anchor, $$props) {
	$.push($$props, true);

	const $activeEditor = () => $.store_get(activeEditor, '$activeEditor', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const editor = getEditor();
	const activeEditor = getActiveEditor();
	let showModal = $.state(false);

	function open() {
		$.set(showModal, true);
	}

	let fileInputEl = $.state(void 0);
	let fileSrc = $.state('');
	let urlSrc = $.state('');
	let altText = $.state('');

	// A file and a URL are mutually exclusive: choosing one disables the other
	// until it's cleared, so only one source can ever be submitted.
	let src = $.derived(() => $.get(fileSrc) || $.get(urlSrc));

	let isDisabled = $.derived(() => $.get(src) === '');
	let isFileChosen = $.derived(() => $.get(fileSrc) !== '');
	let isUrlEntered = $.derived(() => $.get(urlSrc) !== '');
	let isLoading = $.state(false);
	let errorMessage = $.state('');

	$.user_effect(() => {
		if (!$.get(showModal)) {
			clearFile();
			$.set(urlSrc, '');
			$.set(altText, '');
			$.set(errorMessage, '');
		}
	});

	function loadImage(files) {
		if (!files || files.length === 0) return;

		const reader = new FileReader();

		reader.onload = () => {
			if (typeof reader.result === 'string') {
				$.set(fileSrc, reader.result, true);
			}
		};

		reader.readAsDataURL(files[0]);
	}

	function clearFile() {
		$.set(fileSrc, '');

		if ($.get(fileInputEl)) $.get(fileInputEl).value = '';
	}

	async function closeDialog() {
		$.set(showModal, false);
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
		if ($.get(isUrlEntered)) {
			$.set(isLoading, true);
			$.set(errorMessage, '');

			try {
				const base64Src = await urlToBase64($.get(urlSrc));

				InsertImage($activeEditor(), { altText: $.get(altText), src: base64Src });
			} catch {
				$.set(errorMessage, 'Could not load image from that URL. Please check the link and try again.');
				$.set(isLoading, false);

				return;
			}

			$.set(isLoading, false);
		} else {
			InsertImage($activeEditor(), { altText: $.get(altText), src: $.get(src) });
		}

		closeDialog();
	}

	editor.extensions.openInsertImageDialog = open;

	var $$exports = { open };

	ModalDialog($$anchor, {
		get showModal() {
			return $.get(showModal);
		},

		set showModal($$value) {
			$.set(showModal, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var node = $.first_child(fragment_1);

			CloseCircleButton(node, { onclick: () => $.set(showModal, false) });

			var div = $.sibling(node, 2);
			var div_1 = $.sibling($.child(div), 2);
			var div_2 = $.child(div_1);
			var input = $.sibling($.child(div_2), 2);

			$.bind_this(input, ($$value) => $.set(fileInputEl, $$value), () => $.get(fileInputEl));

			var node_1 = $.sibling(input, 2);

			{
				var consequent = ($$anchor) => {
					var button = root();

					$.delegated('click', button, clearFile);
					$.append($$anchor, button);
				};

				$.if(node_1, ($$render) => {
					if ($.get(isFileChosen)) $$render(consequent);
				});
			}

			$.reset(div_2);

			var div_3 = $.sibling(div_2, 2);
			var input_1 = $.sibling($.child(div_3), 2);

			$.remove_input_defaults(input_1);

			var node_2 = $.sibling(input_1, 2);

			{
				var consequent_1 = ($$anchor) => {
					var button_1 = root_1();

					$.delegated('click', button_1, () => $.set(urlSrc, ''));
					$.append($$anchor, button_1);
				};

				$.if(node_2, ($$render) => {
					if ($.get(isUrlEntered)) $$render(consequent_1);
				});
			}

			$.reset(div_3);

			var div_4 = $.sibling(div_3, 2);
			var input_2 = $.sibling($.child(div_4), 2);

			$.remove_input_defaults(input_2);
			$.reset(div_4);

			var node_3 = $.sibling(div_4, 2);

			{
				var consequent_2 = ($$anchor) => {
					var div_5 = root_2();
					var text = $.only_child(div_5, true);

					$.template_effect(() => $.set_text(text, $.get(errorMessage)));
					$.append($$anchor, div_5);
				};

				$.if(node_3, ($$render) => {
					if ($.get(errorMessage)) $$render(consequent_2);
				});
			}

			var div_6 = $.sibling(node_3, 2);
			var button_2 = $.child(div_6);
			var text_1 = $.only_child(button_2, true);

			$.reset(div_6);
			$.reset(div_1);
			$.reset(div);

			$.template_effect(() => {
				input.disabled = $.get(isUrlEntered);
				input_1.disabled = $.get(isFileChosen);
				button_2.disabled = $.get(isDisabled) || $.get(isLoading);
				$.set_text(text_1, $.get(isLoading) ? 'Loading…' : 'Confirm');
			});

			$.delegated('change', input, (e) => loadImage(e.target.files));
			$.bind_value(input_1, () => $.get(urlSrc), ($$value) => $.set(urlSrc, $$value));
			$.bind_value(input_2, () => $.get(altText), ($$value) => $.set(altText, $$value));
			$.delegated('click', button_2, confirm);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}

$.delegate(['change', 'click']);