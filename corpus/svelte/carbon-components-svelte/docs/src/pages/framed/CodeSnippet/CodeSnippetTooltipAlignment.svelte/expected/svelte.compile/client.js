import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CodeSnippet, Stack } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function CodeSnippetTooltipAlignment($$anchor) {
	Stack($$anchor, {
		gap: 6,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			CodeSnippet(node, { code: 'alignment: start', tooltipAlignment: 'start' });

			var node_1 = $.sibling(node, 2);

			CodeSnippet(node_1, { code: 'alignment: center', tooltipAlignment: 'center' });

			var node_2 = $.sibling(node_1, 2);

			CodeSnippet(node_2, { code: 'alignment: end', tooltipAlignment: 'end' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}