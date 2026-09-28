import * as $ from 'svelte/internal/server';
import { Button, Popover } from "carbon-components-svelte";

export default function PopoverFixture($$renderer) {
	let open = false;
	let containerRef;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div data-testid="popover-container" style="position: relative; display: inline-block">`);

		Button($$renderer, {
			'data-testid': 'open-popover',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Toggle popover`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Popover($$renderer, {
			'data-testid': 'popover',
			align: 'bottom',
			closeOnOutsideClick: false,
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<div data-testid="popover-content">Popover content</div> `);

				Button($$renderer, {
					'data-testid': 'close-popover',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Close`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div data-testid="outside" style="margin-top: 2rem; padding: 1rem">Click here to close</div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}