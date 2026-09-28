import * as $ from 'svelte/internal/server';
import { Button, Menu, MenuItem } from "carbon-components-svelte";
import Copy from "carbon-icons-svelte/lib/Copy.svelte";
import Cut from "carbon-icons-svelte/lib/Cut.svelte";
import Paste from "carbon-icons-svelte/lib/Paste.svelte";

export default function MenuItemShortcuts($$renderer) {
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
					icon: Cut,
					shortcutText: '⌘X',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Cut`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				MenuItem($$renderer, {
					icon: Copy,
					shortcutText: '⌘C',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Copy`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				MenuItem($$renderer, {
					icon: Paste,
					shortcutText: '⌘V',
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