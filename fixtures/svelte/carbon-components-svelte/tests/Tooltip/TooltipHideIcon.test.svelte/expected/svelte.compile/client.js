import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Tooltip from "carbon-components-svelte/Tooltip/Tooltip.svelte";

export default function TooltipHideIcon_test($$anchor) {
	Tooltip($$anchor, {
		hideIcon: true,
		triggerText: 'Tooltip trigger',
		iconDescription: 'Information',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('This tooltip has its icon hidden');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}