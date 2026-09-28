import * as $ from 'svelte/internal/server';
import Menu from "carbon-components-svelte/Menu/Menu.svelte";
import MenuItem from "carbon-components-svelte/Menu/MenuItem.svelte";

export default function MenuItem_slot_test($$renderer) {
	let anchor;
	let open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<button type="button">Trigger</button> `);

		Menu($$renderer, {
			anchor,
			labelText: 'Example menu',
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				MenuItem($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Save`);
					},

					$$slots: {
						default: true,
						shortcutText: ($$renderer) => {
							{
								$$renderer.push(`<kbd>⌘S</kbd>`);
							}
						}
					}
				});

				$$renderer.push(`<!----> `);

				MenuItem($$renderer, {
					labelText: 'Export as',
					children: ($$renderer) => {
						MenuItem($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->PDF`);
							},
							$$slots: { default: true }
						});
					},

					$$slots: {
						default: true,
						labelChildren: ($$renderer) => {
							{
								$$renderer.push(`<strong>Custom label content</strong>`);
							}
						}
					}
				});

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