import * as $ from 'svelte/internal/server';
import { Clipboard } from "$lib";

export default function Clipboard_custom_handler_test($$renderer) {
	let clickCount = 0;

	function handleClick() {
		clickCount++;

		// You can test preventDefault by uncommenting this:
		// event.preventDefault();
	}

	{
		function children($$renderer, success) {
			$$renderer.push(`<!---->${$.escape(success ? "Copied!" : `Copy (${clickCount})`)}`);
		}

		Clipboard($$renderer, {
			value: 'test',
			onclick: handleClick,
			'data-testid': 'custom-handler-button',
			children,
			$$slots: { default: true }
		});
	}
}