import * as $ from 'svelte/internal/server';
import TooltipBasic from "./tooltip-basic.svelte";
import TooltipDisabled from "./tooltip-disabled.svelte";
import TooltipFormatted from "./tooltip-formatted.svelte";
import TooltipLongContent from "./tooltip-long-content.svelte";
import TooltipOnLink from "./tooltip-on-link.svelte";
import TooltipSides from "./tooltip-sides.svelte";
import TooltipWithIcon from "./tooltip-with-icon.svelte";
import TooltipWithKeyboard from "./tooltip-with-keyboard.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Tooltip($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			TooltipBasic($$renderer, {});
			$$renderer.push(`<!----> `);
			TooltipSides($$renderer, {});
			$$renderer.push(`<!----> `);
			TooltipWithIcon($$renderer, {});
			$$renderer.push(`<!----> `);
			TooltipLongContent($$renderer, {});
			$$renderer.push(`<!----> `);
			TooltipDisabled($$renderer, {});
			$$renderer.push(`<!----> `);
			TooltipWithKeyboard($$renderer, {});
			$$renderer.push(`<!----> `);
			TooltipOnLink($$renderer, {});
			$$renderer.push(`<!----> `);
			TooltipFormatted($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}