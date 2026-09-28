import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getActiveEditor } from '$lib/core/composerContext.js';
import { FocusEditor, insertColumnsLayout } from '$lib/core/commands/commands.js';
import { getEditor } from '$lib/core/composerContext.js';
import CloseCircleButton from '../../generic/button/CloseCircleButton.svelte';
import ModalDialog from '../../generic/dialog/ModalDialog.svelte';
import DropDownItem from '../../generic/dropdown/DropDownItem.svelte';
import DropDown from '../../generic/dropdown/DropDown.svelte';
import { tick } from 'svelte';

var root = $.from_html(`<span class="text"> </span>`);
var root_1 = $.from_html(`<!> <div class="modal svelte-vihosr"><h2 class="Modal__title">Insert Columns Layout</h2> <div class="Modal__content"><!> <div class="DialogActions"><button type="button" data-test-id="image-modal-file-upload-btn" class="Button__root">Insert</button></div></div></div>`, 1);

export default function InsertColumnsDialog($$anchor, $$props) {
	$.push($$props, true);

	const $activeEditor = () => $.store_get(activeEditor, '$activeEditor', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const editor = getEditor();
	const activeEditor = getActiveEditor();
	let showModal = $.state(false);

	function open() {
		$.set(showModal, true);
	}

	async function close() {
		$.set(showModal, false);
		await tick();
		FocusEditor(editor);
	}

	const LAYOUTS = [
		{ label: '2 columns (equal width)', value: '1fr 1fr' },
		{ label: '2 columns (25% - 75%)', value: '1fr 3fr' },
		{ label: '3 columns (equal width)', value: '1fr 1fr 1fr' },
		{ label: '3 columns (25% - 50% - 25%)', value: '1fr 2fr 1fr' },
		{ label: '4 columns (equal width)', value: '1fr 1fr 1fr 1fr' }
	];

	let currentLabel = $.state($.proxy(LAYOUTS[0].label));
	let currentValue = $.state($.proxy(LAYOUTS[0].value));

	const handleClick = (label, value) => {
		$.set(currentLabel, label, true);
		$.set(currentValue, value, true);
	};

	let modalDiv = $.state(null);

	editor.extensions.openInsertColumnsDialog = open;

	var $$exports = { open };

	ModalDialog($$anchor, {
		stopPropagation: false,
		get showModal() {
			return $.get(showModal);
		},

		set showModal($$value) {
			$.set(showModal, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			CloseCircleButton(node, { onclick: close });

			var div = $.sibling(node, 2);
			var div_1 = $.sibling($.child(div), 2);
			var node_1 = $.child(div_1);

			DropDown(node_1, {
				buttonClassName: 'toolbar-item dialog-dropdown',
				get buttonLabel() {
					return $.get(currentLabel);
				},
				buttonAriaLabel: 'Insert specialized editor node',
				buttonIconClassName: '',
				get target() {
					return $.get(modalDiv);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.each(node_2, 17, () => LAYOUTS, $.index, ($$anchor, layout) => {
						{
							let $0 = $.derived(() => `item ${$.get(currentLabel) === $.get(layout).label ? 'active dropdown-item-active' : ''}`);

							DropDownItem($$anchor, {
								get class() {
									return $.get($0);
								},

								onclick: () => {
									handleClick($.get(layout).label, $.get(layout).value);
								},

								children: ($$anchor, $$slotProps) => {
									var span = root();
									var text = $.only_child(span, true);

									$.template_effect(() => $.set_text(text, $.get(layout).label));
									$.append($$anchor, span);
								},
								$$slots: { default: true }
							});
						}
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var div_2 = $.sibling(node_1, 2);
			var button = $.only_child(div_2);

			$.reset(div_1);
			$.reset(div);
			$.bind_this(div, ($$value) => $.set(modalDiv, $$value), () => $.get(modalDiv));

			$.delegated('click', button, () => {
				insertColumnsLayout($activeEditor(), $.get(currentValue));
				close();
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}

$.delegate(['click']);