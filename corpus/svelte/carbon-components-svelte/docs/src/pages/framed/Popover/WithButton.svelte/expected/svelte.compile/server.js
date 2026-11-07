import * as $ from 'svelte/internal/server';
import { Button, Popover } from "carbon-components-svelte";

export default function WithButton($$renderer) {
	let open = true;
	let ref = null;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div${$.attr_style('', { position: 'relative' })}>`);

		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Toggle popover`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Popover($$renderer, {
			align: 'bottom-left',
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Content`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}