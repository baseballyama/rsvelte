import * as $ from 'svelte/internal/server';
import { Clipboard } from "$lib";

export default function Clipboard_hex_test($$renderer) {
	{
		function children($$renderer, success) {
			$$renderer.push(`<!---->${$.escape(success ? "Copied!" : "Copy Hex")}`);
		}

		Clipboard($$renderer, {
			value: 'Hello & World',
			'data-testid': 'hex-button',
			children,
			$$slots: { default: true }
		});
	}
}