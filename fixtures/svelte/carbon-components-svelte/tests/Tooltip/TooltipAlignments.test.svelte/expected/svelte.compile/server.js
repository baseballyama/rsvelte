import * as $ from 'svelte/internal/server';
import Tooltip from "carbon-components-svelte/Tooltip/Tooltip.svelte";

export default function TooltipAlignments_test($$renderer) {
	const alignments = ["start", "center", "end"];

	$$renderer.push(`<div><!--[-->`);

	const each_array = $.ensure_array_like(alignments);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let align = each_array[$$index];

		$$renderer.push(`<div style="margin: 50px;">`);

		Tooltip($$renderer, {
			open: true,
			align,
			iconDescription: 'Information',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Tooltip with ${$.escape(align)} alignment`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	}

	$$renderer.push(`<!--]--></div>`);
}