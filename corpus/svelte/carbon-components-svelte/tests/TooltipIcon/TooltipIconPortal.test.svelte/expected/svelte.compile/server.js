import * as $ from 'svelte/internal/server';
import TooltipIcon from "carbon-components-svelte/TooltipIcon/TooltipIcon.svelte";
import Carbon from "carbon-icons-svelte/lib/Carbon.svelte";

export default function TooltipIconPortal_test($$renderer) {
	const directions = ["top", "right", "bottom", "left"];

	$$renderer.push(`<div><!--[-->`);

	const each_array = $.ensure_array_like(directions);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let direction = each_array[$$index];

		$$renderer.push(`<div style="margin: 50px;">`);

		TooltipIcon($$renderer, {
			portalTooltip: true,
			enterDelayMs: 0,
			leaveDelayMs: 0,
			tooltipText: `Portal tooltip ${$.stringify(direction)}`,
			direction,
			icon: Carbon
		});

		$$renderer.push(`<!----></div>`);
	}

	$$renderer.push(`<!--]--></div>`);
}