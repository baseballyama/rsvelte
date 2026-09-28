import * as $ from 'svelte/internal/server';
import { Clipboard } from "$lib";

export default function Clipboard_copy_test($$renderer) {
	{
		function children($$renderer, success) {
			$$renderer.push(`<!---->${$.escape(success ? "Copied!" : "Copy")}`);
		}

		Clipboard($$renderer, {
			value: 'Hello, World!',
			'data-testid': 'copy-button',
			children,
			$$slots: { default: true }
		});
	}
}