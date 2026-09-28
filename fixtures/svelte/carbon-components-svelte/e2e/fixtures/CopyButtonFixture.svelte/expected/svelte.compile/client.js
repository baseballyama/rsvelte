import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CopyButton } from "carbon-components-svelte";
import CheckmarkIcon from "./CheckmarkIcon.svelte";

var root = $.from_html(`<p data-testid="copied-value"> </p>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function CopyButtonFixture($$anchor) {
	let copiedText = null;
	var fragment = root_1();
	var node = $.first_child(fragment);

	CopyButton(node, {
		'data-testid': 'copy-button',
		text: 'Hello, World!',
		iconDescription: 'Copy to clipboard',
		feedback: 'Copied!',
		copy: (text) => {
			copiedText = text;
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var p = root();
			var text_1 = $.only_child(p);

			$.template_effect(() => $.set_text(text_1, `Copied: ${copiedText ?? ''}`));
			$.append($$anchor, p);
		};

		$.if(node_1, ($$render) => {
			if (copiedText) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	CopyButton(node_2, {
		'data-testid': 'copy-button-feedback-icon',
		text: 'Hello, World!',
		iconDescription: 'Copy with feedback icon',
		feedback: 'Copied with icon!',
		get feedbackIcon() {
			return CheckmarkIcon;
		},
		feedbackTimeout: 500,
		copy: () => {}
	});

	$.append($$anchor, fragment);
}