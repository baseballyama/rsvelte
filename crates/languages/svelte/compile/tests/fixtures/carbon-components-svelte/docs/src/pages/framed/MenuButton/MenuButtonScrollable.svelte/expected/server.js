import * as $ from 'svelte/internal/server';
import { MenuButton, MenuItem } from "carbon-components-svelte";

export default function MenuButtonScrollable($$renderer) {
	const actions = Array.from({ length: 20 }, (_, index) => `Action ${index + 1}`);

	MenuButton($$renderer, {
		labelText: 'Actions',
		maxHeight: 240,
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
}