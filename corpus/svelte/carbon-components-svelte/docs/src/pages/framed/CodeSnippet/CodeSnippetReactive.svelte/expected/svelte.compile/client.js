import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, CodeSnippet } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function CodeSnippetReactive($$anchor, $$props) {
	$.push($$props, true);

	let expanded = false;
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		$$events: { click: () => expanded = !expanded },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Toggle expansion');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => Array.from({ length: 30 }, (_, i) => i + 1).join("\n"));

		CodeSnippet(node_1, {
			type: 'multi',
			get code() {
				return $.get($0);
			},

			get expanded() {
				return expanded;
			},

			set expanded($$value) {
				expanded = $$value;
			},

			$$events: {
				expand: () => {
					console.log("on:expand");
				},

				collapse: () => {
					console.log("on:collapse");
				}
			}
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}