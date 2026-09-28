import * as $ from 'svelte/internal/server';
import TooltipDefinition from "carbon-components-svelte/TooltipDefinition/TooltipDefinition.svelte";

export default function TooltipDefinitionPortal_test($$renderer) {
	const directions = ["top", "bottom"];

	$$renderer.push(`<div><!--[-->`);

	const each_array = $.ensure_array_like(directions);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let direction = each_array[$$index];

		$$renderer.push(`<div style="margin: 50px;">`);

		TooltipDefinition($$renderer, {
			portalTooltip: true,
			open: true,
			tooltipText: `Portal tooltip ${$.stringify(direction)}`,
			direction,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Definition ${$.escape(direction)}`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	}

	$$renderer.push(`<!--]--></div>`);
}