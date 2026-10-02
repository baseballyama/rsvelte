import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CopyButton, Stack } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function CopyButtonPortalTooltip($$anchor) {
	Stack($$anchor, {
		gap: 4,
		style: 'overflow: hidden; border: 1px dashed var(--cds-border-subtle); padding: 1rem; max-height: 120px;',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			CopyButton(node, {
				text: 'Carbon svelte',
				feedback: 'Portalled (default)',
				tooltipAlignment: 'start'
			});

			var node_1 = $.sibling(node, 2);

			CopyButton(node_1, {
				text: 'Carbon svelte',
				feedback: 'Inline caret',
				portalTooltip: false,
				tooltipAlignment: 'start'
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}