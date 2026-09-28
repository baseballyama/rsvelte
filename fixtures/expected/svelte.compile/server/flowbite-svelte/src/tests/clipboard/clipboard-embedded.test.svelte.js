import * as $ from 'svelte/internal/server';
import { Clipboard } from "$lib";

export default function Clipboard_embedded_test($$renderer) {
	{
		function children($$renderer, success) {
			$$renderer.push(`<!---->${$.escape(success ? "Copied!" : "Copy Embedded")}`);
		}

		Clipboard($$renderer, {
			value: 'test',
			embedded: true,
			'data-testid': 'embedded-button',
			children,
			$$slots: { default: true }
		});
	}
}