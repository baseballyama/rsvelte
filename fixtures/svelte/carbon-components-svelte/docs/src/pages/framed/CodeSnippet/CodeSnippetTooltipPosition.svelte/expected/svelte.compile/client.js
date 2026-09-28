import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CodeSnippet, Stack } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function CodeSnippetTooltipPosition($$anchor) {
	Stack($$anchor, {
		gap: 6,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			CodeSnippet(node, { code: 'position: top', tooltipPosition: 'top' });

			var node_1 = $.sibling(node, 2);

			CodeSnippet(node_1, { code: 'position: right', tooltipPosition: 'right' });

			var node_2 = $.sibling(node_1, 2);

			CodeSnippet(node_2, { code: 'position: bottom', tooltipPosition: 'bottom' });

			var node_3 = $.sibling(node_2, 2);

			CodeSnippet(node_3, { code: 'position: left', tooltipPosition: 'left' });

			var node_4 = $.sibling(node_3, 2);

			CodeSnippet(node_4, { type: 'inline', code: 'inline', tooltipPosition: 'right' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}