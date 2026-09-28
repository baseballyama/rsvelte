import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, tick } from 'svelte';

import {
	CloseCircleButton,
	InsertImageUploadedDialogBody,
	ModalDialog,
	InsertImageUriDialogBody,
	getActiveEditor,
	getEditor,
	InsertImage,
	FocusEditor
} from 'svelte-lexical';

import landscapeImage from './images/landscape.jpg';
import yellowFlowerImage from './images/yellow-flower.jpg';

var root = $.from_html(`<div class="modal svelte-rywddl"><h2 class="Modal__title">Insert Image</h2> <div class="Modal__content"><div class="ToolbarPlugin__dialogButtonsList"><button class="Button__root" data-test-id="image-modal-option-sample">Sample</button> <button class="Button__root" data-test-id="image-modal-option-url">URL</button> <button class="Button__root" data-test-id="image-modal-option-file">File</button></div></div></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function InsertImageDialog($$anchor, $$props) {
	$.push($$props, true);

	const $activeEditor = () => $.store_get(activeEditor, '$activeEditor', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let showModal = $.state(false);

	function open() {
		$.set(showModal, true);
	}

	let mode = $.state(null);

	$.user_effect(() => {
		if (!$.get(showModal)) {
			$.set(mode, null);
		}
	});

	let hasModifier = $.state(false);
	const editor = getEditor();
	const activeEditor = getActiveEditor();

	onMount(() => {
		$.set(hasModifier, false);

		const handler = (e) => {
			$.set(hasModifier, e.altKey, true);
		};

		document.addEventListener('keydown', handler);

		return () => {
			document.removeEventListener('keydown', handler);
		};
	});

	function insertAndClose(payload) {
		InsertImage($activeEditor(), payload);
		closeDialog();
	}

	async function closeDialog() {
		$.set(showModal, false);
		await tick();
		FocusEditor(editor);
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
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			CloseCircleButton(node, { onclick: () => $.set(showModal, false) });

			var node_1 = $.sibling(node, 2);

			{
				var consequent = ($$anchor) => {
					var div = root();
					var div_1 = $.sibling($.child(div), 2);
					var div_2 = $.child(div_1);
					var button = $.child(div_2);
					var button_1 = $.sibling(button, 2);
					var button_2 = $.sibling(button_1, 2);

					$.reset(div_2);
					$.reset(div_1);
					$.reset(div);

					$.delegated('click', button, () => insertAndClose($.get(hasModifier)
						? {
							altText: 'Daylight fir trees forest glacier green high ice landscape',
							src: landscapeImage
						}
						: {
							altText: 'Yellow flower in tilt shift lens',
							src: yellowFlowerImage
						}));

					$.delegated('click', button_1, () => $.set(mode, 'url'));
					$.delegated('click', button_2, () => $.set(mode, 'file'));
					$.append($$anchor, div);
				};

				var consequent_1 = ($$anchor) => {
					InsertImageUriDialogBody($$anchor, { onconfirm: closeDialog });
				};

				var consequent_2 = ($$anchor) => {
					InsertImageUploadedDialogBody($$anchor, { onconfirm: closeDialog });
				};

				$.if(node_1, ($$render) => {
					if (!$.get(mode)) $$render(consequent); else if ($.get(mode) === 'url') $$render(consequent_1, 1); else if ($.get(mode) === 'file') $$render(consequent_2, 2);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}

$.delegate(['click']);