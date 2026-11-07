import * as $ from 'svelte/internal/server';
import { Button, Dialog, Stack } from "carbon-components-svelte";

export default function Dialog_1($$renderer) {
	let open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Open dialog`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Dialog($$renderer, {
			'aria-label': 'Example dialog',
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
						$$renderer.push(`<p>This dialog has no backdrop. The page behind it stays interactive.</p> `);

						Button($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Close`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
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