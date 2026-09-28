import * as $ from 'svelte/internal/server';
import Tooltip from "carbon-components-svelte/Tooltip/Tooltip.svelte";

export default function TooltipTwoInstancesFocus_test($$renderer) {
	Tooltip($$renderer, {
		triggerText: 'First',
		children: ($$renderer) => {
			$$renderer.push(`<p><a href="/first">Learn more</a></p>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tooltip($$renderer, {
		triggerText: 'Second',
		children: ($$renderer) => {
			$$renderer.push(`<p>Second tooltip content</p>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}