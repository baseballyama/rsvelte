import * as $ from 'svelte/internal/server';
import { getActiveEditor } from '$lib/core/composerContext.js';
import ModalDialog from '../../generic/dialog/ModalDialog.svelte';
import { FocusEditor, insertTable } from '$lib/core/commands/commands.js';
import NumberInput from '$lib/components/generic/input/NumberInput.svelte';
import CloseCircleButton from '$lib/components/generic/button/CloseCircleButton.svelte';
import { tick } from 'svelte';

export default function InsertTableDialog($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let rows = '5';
		let columns = '5';
		let isDisabled = true;
		const activeEditor = getActiveEditor();
		let showModal = false;

		function open() {
			showModal = true;
		}

		async function close() {
			showModal = false;
			await tick();
			FocusEditor($.store_get($$store_subs ??= {}, '$activeEditor', activeEditor));
		}

		const onClick = () => {
			insertTable($.store_get($$store_subs ??= {}, '$activeEditor', activeEditor), columns, rows);
			close();
		};

		$.store_mutate($$store_subs ??= {}, '$activeEditor', activeEditor, $.store_get($$store_subs ??= {}, '$activeEditor', activeEditor).extensions.openInsertTableDialog = open);

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
					$$renderer.push(`<!----> <div class="modal svelte-ftr5co"><h2 class="Modal__title">Insert Table</h2> <div class="Modal__content">`);

					NumberInput($$renderer, {
						placeholder: '# of rows (1-500)',
						label: 'Rows',
						dataTestId: 'table-modal-rows',
						get value() {
							return rows;
						},

						set value($$value) {
							rows = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					NumberInput($$renderer, {
						placeholder: '# of columns (1-50)',
						label: 'Columns',
						dataTestId: 'table-modal-columns',
						get value() {
							return columns;
						},

						set value($$value) {
							columns = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> <div class="DialogActions" data-test-id="table-model-confirm-insert"><button type="button"${$.attr('disabled', isDisabled, true)}${$.attr_class('Button__root', void 0, { 'Button__disabled': isDisabled })}>Confirm</button></div></div></div>`);
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { open });
	});
}