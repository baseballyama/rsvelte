import * as $ from 'svelte/internal/server';
import Tooltip from "carbon-components-svelte/Tooltip/Tooltip.svelte";

export default function TooltipDirections_test($$renderer) {
	const directions = ["top", "right", "bottom", "left"];

	$$renderer.push(`<div><!--[-->`);

	const each_array = $.ensure_array_like(directions);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let direction = each_array[$$index];

		$$renderer.push(`<div style="margin: 50px;">`);

		Tooltip($$renderer, {
			open: true,
			direction,
			iconDescription: 'Information',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Tooltip with ${$.escape(direction)} direction`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	}

	$$renderer.push(`<!--]--></div>`);
}