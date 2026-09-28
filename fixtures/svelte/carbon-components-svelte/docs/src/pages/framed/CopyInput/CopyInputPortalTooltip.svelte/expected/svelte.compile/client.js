import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CopyInput, Stack } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function CopyInputPortalTooltip($$anchor) {
	Stack($$anchor, {
		gap: 4,
		style: 'overflow: hidden; border: 1px dashed var(--cds-border-subtle); padding: 1rem; max-height: 160px;',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			CopyInput(node, {
				labelText: 'Portalled (default)',
				value: 'sk-1234567890abcdef'
			});

			var node_1 = $.sibling(node, 2);

			CopyInput(node_1, {
				labelText: 'Inline caret',
				value: 'sk-1234567890abcdef',
				portalTooltip: false
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}