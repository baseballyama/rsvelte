import * as $ from 'svelte/internal/server';
import { Button, Menu, MenuDivider, MenuItem } from "carbon-components-svelte";
import TrashCan from "carbon-icons-svelte/lib/TrashCan.svelte";

export default function MenuItemDanger($$renderer) {
	let anchor;
	let open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			get ref() {
				return anchor;
			},

			set ref($$value) {
				anchor = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Actions`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Menu($$renderer, {
			anchor,
			labelText: 'Actions menu',
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
						$$renderer.push(`<!---->Cut`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				MenuItem($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Copy`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);
				MenuDivider($$renderer, {});
				$$renderer.push(`<!----> `);

				MenuItem($$renderer, {
					icon: TrashCan,
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