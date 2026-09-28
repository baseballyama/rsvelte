import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Tooltip from "carbon-components-svelte/Tooltip/Tooltip.svelte";

export default function TooltipOpen_test($$anchor) {
	Tooltip($$anchor, {
		open: true,
		iconDescription: 'Information',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('This tooltip is initially open');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}