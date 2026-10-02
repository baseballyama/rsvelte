import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Clipboard } from "$lib";

export default function Clipboard_custom_handler_test($$anchor) {
	let clickCount = 0;

	function handleClick() {
		clickCount++;

		// You can test preventDefault by uncommenting this:
		// event.preventDefault();
	}

	{
		const children = ($$anchor, success = $.noop) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, success() ? "Copied!" : `Copy (${clickCount})`));
			$.append($$anchor, text);
		};

		Clipboard($$anchor, {
			value: 'test',
			onclick: handleClick,
			'data-testid': 'custom-handler-button',
			children,
			$$slots: { default: true }
		});
	}
}