import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Tooltip from "carbon-components-svelte/Tooltip/Tooltip.svelte";

var root = $.from_html(`<div slot="icon" data-testid="custom-icon">🔍</div>`);

export default function TooltipCustomIcon_test($$anchor) {
	Tooltip($$anchor, {
		iconDescription: 'Information',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Custom icon tooltip');

			$.append($$anchor, text);
		},

		$$slots: {
			default: true,
			icon: ($$anchor, $$slotProps) => {
				var div = root();

				$.append($$anchor, div);
			}
		}
	});
}