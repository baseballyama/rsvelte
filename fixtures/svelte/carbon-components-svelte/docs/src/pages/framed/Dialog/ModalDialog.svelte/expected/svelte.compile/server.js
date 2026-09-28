import * as $ from 'svelte/internal/server';
import { Button, Dialog, Stack } from "carbon-components-svelte";

export default function ModalDialog($$renderer) {
	let open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Open modal dialog`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Dialog($$renderer, {
			modal: true,
			'aria-label': 'Example modal dialog',
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				Stack($$renderer, {
					gap: 5,
					children: ($$renderer) => {
						$$renderer.push(`<p>Dialog content.</p> <form method="dialog">`);

						Button($$renderer, {
							type: 'submit',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Close`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></form>`);
					},
					$$slots: { default: true }
				});
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