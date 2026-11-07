import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CodeSnippet, Stack } from "carbon-components-svelte";

var root = $.from_html(`<div><!></div> <!> <!>`, 1);

export default function CodeSnippetPortalTooltip($$anchor) {
	let multiCode = "export function add(a, b) {\n  return a + b;\n}\n\nexport function subtract(a, b) {\n  return a - b;\n}";

	Stack($$anchor, {
		gap: 4,
		style: 'overflow: hidden; border: 1px dashed var(--cds-border-subtle); padding: 1rem; max-height: 200px;',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			CodeSnippet(node, {
				type: 'inline',
				code: 'rm -rf node_modules/',
				feedback: 'Copied!'
			});

			$.reset(div);

			var node_1 = $.sibling(div, 2);

			CodeSnippet(node_1, { code: 'npm i carbon-components-svelte', feedback: 'Copied!' });

			var node_2 = $.sibling(node_1, 2);

			CodeSnippet(node_2, { type: 'multi', code: multiCode, feedback: 'Copied!' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}