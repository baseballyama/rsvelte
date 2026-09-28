import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getActiveEditor } from '$lib/core/composerContext.js';
import ModalDialog from '../../generic/dialog/ModalDialog.svelte';
import { FocusEditor, insertTable } from '$lib/core/commands/commands.js';
import NumberInput from '$lib/components/generic/input/NumberInput.svelte';
import CloseCircleButton from '$lib/components/generic/button/CloseCircleButton.svelte';
import { tick } from 'svelte';

var root = $.from_html(`<!> <div class="modal svelte-ftr5co"><h2 class="Modal__title">Insert Table</h2> <div class="Modal__content"><!> <!> <div class="DialogActions" data-test-id="table-model-confirm-insert"><button type="button">Confirm</button></div></div></div>`, 1);

export default function InsertTableDialog($$anchor, $$props) {
	$.push($$props, true);

	const $activeEditor = () => $.store_get(activeEditor, '$activeEditor', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let rows = $.state('5');
	let columns = $.state('5');
	let isDisabled = $.state(true);

	$.user_effect(() => {
		const row = Number($.get(rows));
		const column = Number($.get(columns));

		if (row && row > 0 && row <= 500 && column && column > 0 && column <= 50) {
			$.set(isDisabled, false);
		} else {
			$.set(isDisabled, true);
		}
	});

	const activeEditor = getActiveEditor();
	let showModal = $.state(false);

	function open() {
		$.set(showModal, true);
	}

	async function close() {
		$.set(showModal, false);
		await tick();
		FocusEditor($activeEditor());
	}

	const onClick = () => {
		insertTable($activeEditor(), $.get(columns), $.get(rows));
		close();
	};

	$.store_mutate(activeEditor, $.untrack($activeEditor).extensions.openInsertTableDialog = open, $.untrack($activeEditor));

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

			NumberInput(node_1, {
				placeholder: '# of rows (1-500)',
				label: 'Rows',
				dataTestId: 'table-modal-rows',
				get value() {
					return $.get(rows);
				},

				set value($$value) {
					$.set(rows, $$value, true);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			NumberInput(node_2, {
				placeholder: '# of columns (1-50)',
				label: 'Columns',
				dataTestId: 'table-modal-columns',
				get value() {
					return $.get(columns);
				},

				set value($$value) {
					$.set(columns, $$value, true);
				}
			});

			var div_2 = $.sibling(node_2, 2);
			var button = $.child(div_2);
			let classes;

			$.reset(div_2);
			$.reset(div_1);
			$.reset(div);

			$.template_effect(() => {
				button.disabled = $.get(isDisabled);
				classes = $.set_class(button, 1, 'Button__root', null, classes, { Button__disabled: $.get(isDisabled) });
			});

			$.delegated('click', button, onClick);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}

$.delegate(['click']);