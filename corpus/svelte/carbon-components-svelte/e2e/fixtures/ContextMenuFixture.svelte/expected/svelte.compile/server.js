import * as $ from 'svelte/internal/server';
import { ContextMenu, ContextMenuOption } from "carbon-components-svelte";

export default function ContextMenuFixture($$renderer) {
	let target;
	let open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div data-testid="context-target">Right click me</div> `);

		ContextMenu($$renderer, {
			open,
			get target() {
				return target;
			},

			set target($$value) {
				target = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				ContextMenuOption($$renderer, { labelText: 'Option 1' });
				$$renderer.push(`<!----> `);
				ContextMenuOption($$renderer, { labelText: 'Option 2' });
				$$renderer.push(`<!---->`);
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