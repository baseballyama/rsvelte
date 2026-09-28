import * as $ from 'svelte/internal/server';
import { getActiveEditor } from '$lib/core/composerContext.js';
import { FocusEditor, insertColumnsLayout } from '$lib/core/commands/commands.js';
import { getEditor } from '$lib/core/composerContext.js';
import CloseCircleButton from '../../generic/button/CloseCircleButton.svelte';
import ModalDialog from '../../generic/dialog/ModalDialog.svelte';
import DropDownItem from '../../generic/dropdown/DropDownItem.svelte';
import DropDown from '../../generic/dropdown/DropDown.svelte';
import { tick } from 'svelte';

export default function InsertColumnsDialog($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const editor = getEditor();
		const activeEditor = getActiveEditor();
		let showModal = false;

		function open() {
			showModal = true;
		}

		async function close() {
			showModal = false;
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

		let currentLabel = LAYOUTS[0].label;
		let currentValue = LAYOUTS[0].value;

		const handleClick = (label, value) => {
			currentLabel = label;
			currentValue = value;
		};

		let modalDiv = null;

		editor.extensions.openInsertColumnsDialog = open;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ModalDialog($$renderer, {
				stopPropagation: false,
				get showModal() {
					return showModal;
				},

				set showModal($$value) {
					showModal = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					CloseCircleButton($$renderer, { onclick: close });
					$$renderer.push(`<!----> <div class="modal svelte-vihosr"><h2 class="Modal__title">Insert Columns Layout</h2> <div class="Modal__content">`);

					DropDown($$renderer, {
						buttonClassName: 'toolbar-item dialog-dropdown',
						buttonLabel: currentLabel,
						buttonAriaLabel: 'Insert specialized editor node',
						buttonIconClassName: '',
						target: modalDiv,
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like(LAYOUTS);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let layout = each_array[$$index];

								DropDownItem($$renderer, {
									class: `item ${currentLabel === layout.label ? 'active dropdown-item-active' : ''}`,
									onclick: () => {
										handleClick(layout.label, layout.value);
									},

									children: ($$renderer) => {
										$$renderer.push(`<span class="text">${$.escape(layout.label)}</span>`);
									},
									$$slots: { default: true }
								});
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <div class="DialogActions"><button type="button" data-test-id="image-modal-file-upload-btn" class="Button__root">Insert</button></div></div></div>`);
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