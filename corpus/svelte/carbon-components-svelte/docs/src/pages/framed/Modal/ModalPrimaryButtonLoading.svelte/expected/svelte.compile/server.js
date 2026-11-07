import * as $ from 'svelte/internal/server';
import { Button, Modal } from "carbon-components-svelte";

export default function ModalPrimaryButtonLoading($$renderer) {
	let open = false;
	let saving = false;

	function onSave() {
		saving = true;

		setTimeout(
			() => {
				saving = false;
				open = false;
			},
			2000
		);
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Save changes`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Modal($$renderer, {
			modalHeading: 'Save changes',
			primaryButtonText: 'Save',
			secondaryButtonText: 'Cancel',
			primaryButtonLoading: saving,
			primaryButtonLoadingDescription: 'Saving...',
			preventCloseOnClickOutside: saving,
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<p>Save your changes to the Cloudant database configuration.</p>`);
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