import * as $ from 'svelte/internal/server';
import { OverflowMenu, OverflowMenuItem } from "carbon-components-svelte";

export default function OverflowMenuScrollable($$renderer) {
	const workspaces = Array.from({ length: 20 }, (_, index) => `Workspace ${index + 1}`);

	OverflowMenu($$renderer, {
		maxHeight: 240,
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(workspaces);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let workspace = each_array[$$index];

				OverflowMenuItem($$renderer, { text: workspace });
			}

			$$renderer.push(`<!--]--> `);
			OverflowMenuItem($$renderer, { hasDivider: true, danger: true, text: 'Delete service' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}