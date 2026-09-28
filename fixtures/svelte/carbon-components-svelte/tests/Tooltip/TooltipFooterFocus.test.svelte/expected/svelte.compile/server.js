import * as $ from 'svelte/internal/server';
import Tooltip from "carbon-components-svelte/Tooltip/Tooltip.svelte";
import TooltipFooter from "carbon-components-svelte/Tooltip/TooltipFooter.svelte";

export default function TooltipFooterFocus_test($$renderer) {
	Tooltip($$renderer, {
		triggerText: 'Resource list',
		children: ($$renderer) => {
			$$renderer.push(`<p>Resources are provisioned based on your account's organization.</p> `);

			TooltipFooter($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<a href="/">Learn more</a> <button type="button">Manage</button>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}