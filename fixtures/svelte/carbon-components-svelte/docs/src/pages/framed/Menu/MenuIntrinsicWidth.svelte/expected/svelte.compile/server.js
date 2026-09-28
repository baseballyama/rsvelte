import * as $ from 'svelte/internal/server';
import { Button, Menu, MenuItem } from "carbon-components-svelte";

export default function MenuIntrinsicWidth($$renderer) {
	let anchor;
	let open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div style="width: 320px;">`);

		Button($$renderer, {
			get ref() {
				return anchor;
			},

			set ref($$value) {
				anchor = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Actions on this wide button`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		Menu($$renderer, {
			anchor,
			intrinsicWidth: true,
			intrinsicAlign: 'start',
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

				MenuItem($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Paste`);
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