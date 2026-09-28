import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Tooltip from "carbon-components-svelte/Tooltip/Tooltip.svelte";

var root = $.from_html(`<p data-testid="tooltip-content">Custom tooltip content</p>`);

export default function TooltipCustomContent_test($$anchor) {
	Tooltip($$anchor, {
		open: true,
		iconDescription: 'Information',
		children: ($$anchor, $$slotProps) => {
			var p = root();

			$.append($$anchor, p);
		},
		$$slots: { default: true }
	});
}