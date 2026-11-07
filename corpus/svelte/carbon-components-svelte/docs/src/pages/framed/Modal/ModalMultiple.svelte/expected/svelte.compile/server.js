import * as $ from 'svelte/internal/server';
import { Button, Modal } from "carbon-components-svelte";

export default function ModalMultiple($$renderer) {
	let openCreate = false;
	let openDelete = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Create database`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			kind: 'danger-tertiary',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Delete database`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Modal($$renderer, {
			modalHeading: 'Create database',
			primaryButtonText: 'Confirm',
			secondaryButtonText: 'Cancel',
			get open() {
				return openCreate;
			},

			set open($$value) {
				openCreate = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<p>Create a new Cloudant database in the US South region.</p>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Modal($$renderer, {
			danger: true,
			modalHeading: 'Delete database',
			primaryButtonText: 'Delete',
			secondaryButtonText: 'Cancel',
			get open() {
				return openDelete;
			},

			set open($$value) {
				openDelete = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<p>This is a permanent action and cannot be undone.</p>`);
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