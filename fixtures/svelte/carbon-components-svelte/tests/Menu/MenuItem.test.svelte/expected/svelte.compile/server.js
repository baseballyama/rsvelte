import * as $ from 'svelte/internal/server';
import Menu from "carbon-components-svelte/Menu/Menu.svelte";
import MenuDivider from "carbon-components-svelte/Menu/MenuDivider.svelte";
import MenuItem from "carbon-components-svelte/Menu/MenuItem.svelte";
import Add from "carbon-icons-svelte/lib/Add.svelte";

export default function MenuItem_test($$renderer) {
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
					icon: Add,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Add item`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				MenuItem($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Plain`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);
				MenuItem($$renderer, { labelText: 'Standalone label' });
				$$renderer.push(`<!----> `);

				MenuItem($$renderer, {
					shortcutText: '⌘S',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Save`);
					},
					$$slots: { default: true }
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

						$$renderer.push(`<!----> `);

						MenuItem($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->JPG`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						MenuItem($$renderer, {
							disabled: true,
							children: ($$renderer) => {
								$$renderer.push(`<!---->PNG`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);
				MenuDivider($$renderer, {});
				$$renderer.push(`<!----> `);

				MenuItem($$renderer, {
					kind: 'danger',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Delete`);
					},
					$$slots: { default: true }
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