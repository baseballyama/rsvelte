import * as $ from 'svelte/internal/server';
import { Button, Menu, MenuItem } from "carbon-components-svelte";

export default function MenuScrollable($$renderer) {
	let anchor;
	let open = false;
	const actions = Array.from({ length: 20 }, (_, index) => `Action ${index + 1}`);
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
			maxHeight: 240,
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(actions);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let action = each_array[$$index];

					MenuItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(action)}`);
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]-->`);
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