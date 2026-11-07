import * as $ from 'svelte/internal/server';
import { Button, Dialog, Stack } from "carbon-components-svelte";

export default function DialogCloseTriggers($$renderer) {
	let open = false;
	let lastTrigger = null;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 5,
			children: ($$renderer) => {
				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Open modal dialog`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				if (lastTrigger) {
					$$renderer.push(`<!--[0--><p>Last close trigger: <code>${$.escape(lastTrigger)}</code></p>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Dialog($$renderer, {
			modal: true,
			'aria-label': 'Close trigger example',
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
						$$renderer.push(`<p>Dismiss with <kbd>Escape</kbd>, the backdrop, the close button, or by
      setting <code>open</code> to <code>false</code>.</p> <form method="dialog">`);

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