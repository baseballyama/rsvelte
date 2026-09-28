import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getActiveEditor } from '$lib/core/composerContext.js';
import { INSERT_IMAGE_COMMAND } from '$lib/core/plugins/Image/ImagePlugin.svelte';
import TextInput from '../../generic/input/TextInput.svelte';

var root = $.from_html(`<div class="modal svelte-19n1zc7"><h2 class="Modal__title">Insert Image</h2> <div class="Modal__content"><!> <!> <div class="DialogActions"><button type="button" data-test-id="image-modal-confirm-btn" class="Button__root">Confirm</button></div></div></div>`);

export default function InsertImageUriDialogBody($$anchor, $$props) {
	$.push($$props, true);

	const $activeEditor = () => $.store_get(activeEditor, '$activeEditor', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const activeEditor = getActiveEditor();
	let src = $.state('');
	let altText = $.state('');
	let isDisabled = $.derived(() => $.get(src) === '');
	var div = root();
	var div_1 = $.sibling($.child(div), 2);
	var node = $.child(div_1);

	TextInput(node, {
		label: 'Image URL',
		placeholder: 'i.e. https://source.unsplash.com/random',
		dataTestId: 'image-modal-url-input',
		id: 'lexical-modal-image-url',
		get value() {
			return $.get(src);
		},

		set value($$value) {
			$.set(src, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	TextInput(node_1, {
		label: 'Alt Text',
		placeholder: 'Random unsplash image',
		dataTestId: 'image-modal-alt-text-input',
		id: 'lexical-modal-image-alttext',
		get value() {
			return $.get(altText);
		},

		set value($$value) {
			$.set(altText, $$value, true);
		}
	});

	var div_2 = $.sibling(node_1, 2);
	var button = $.only_child(div_2);

	$.reset(div_1);
	$.reset(div);
	$.template_effect(() => button.disabled = $.get(isDisabled));

	$.delegated('click', button, () => {
		$activeEditor().dispatchCommand(INSERT_IMAGE_COMMAND, { altText: $.get(altText), src: $.get(src) });
		$$props.onconfirm?.();
	});

	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);