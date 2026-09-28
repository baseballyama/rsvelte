import * as $ from 'svelte/internal/server';
import { Clipboard } from "$lib";

export default function Clipboard_empty_test($$renderer) {
	{
		function children($$renderer, success) {
			$$renderer.push(`<!---->${$.escape(success ? "Copied!" : "Copy Empty")}`);
		}

		Clipboard($$renderer, {
			value: '',
			'data-testid': 'empty-button',
			children,
			$$slots: { default: true }
		});
	}
}