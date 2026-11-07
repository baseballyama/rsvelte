import * as $ from 'svelte/internal/server';
import { CopyButton } from "carbon-components-svelte";
import CheckmarkIcon from "./CheckmarkIcon.svelte";

export default function CopyButtonFixture($$renderer) {
	let copiedText = null;

	CopyButton($$renderer, {
		'data-testid': 'copy-button',
		text: 'Hello, World!',
		iconDescription: 'Copy to clipboard',
		feedback: 'Copied!',
		copy: (text) => {
			copiedText = text;
		}
	});

	$$renderer.push(`<!----> `);

	if (copiedText) {
		$$renderer.push(`<!--[0--><p data-testid="copied-value">Copied: ${$.escape(copiedText)}</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	CopyButton($$renderer, {
		'data-testid': 'copy-button-feedback-icon',
		text: 'Hello, World!',
		iconDescription: 'Copy with feedback icon',
		feedback: 'Copied with icon!',
		feedbackIcon: CheckmarkIcon,
		feedbackTimeout: 500,
		copy: () => {}
	});

	$$renderer.push(`<!---->`);
}