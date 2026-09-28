import * as $ from 'svelte/internal/server';
import { Dialog } from "carbon-components-svelte";

export default function DialogFixture($$renderer) {
	let modalOpen = false;
	let modalOpenCount = 0;
	let modalCloseCount = 0;

	/** @type {string | null} */
	let modalCloseTrigger = null;

	let nonModalOpen = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<button type="button" data-testid="open-modal">Open modal dialog</button> <div data-testid="modal-open-count">${$.escape(modalOpenCount)}</div> <div data-testid="modal-close-count">${$.escape(modalCloseCount)}</div> <div data-testid="modal-close-trigger">${$.escape(modalCloseTrigger ?? "")}</div> `);

		Dialog($$renderer, {
			modal: true,
			'aria-label': 'Modal dialog',
			'data-testid': 'modal-dialog',
			get open() {
				return modalOpen;
			},

			set open($$value) {
				modalOpen = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<p>Modal content</p> <button type="button" data-testid="modal-focus-target">Focus target</button> <form method="dialog"><button type="submit" data-testid="modal-close-button">Close</button></form>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <button type="button" data-testid="open-non-modal">Open non-modal dialog</button> <button type="button" data-testid="outside-button">Outside button</button> `);

		Dialog($$renderer, {
			'aria-label': 'Non-modal dialog',
			'data-testid': 'non-modal-dialog',
			get open() {
				return nonModalOpen;
			},

			set open($$value) {
				nonModalOpen = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<p>Non-modal content</p>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}