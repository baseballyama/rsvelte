import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Clipboard } from "$lib";

export default function Clipboard_hex_test($$anchor) {
	{
		const children = ($$anchor, success = $.noop) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, success() ? "Copied!" : "Copy Hex"));
			$.append($$anchor, text);
		};

		Clipboard($$anchor, {
			value: 'Hello & World',
			'data-testid': 'hex-button',
			children,
			$$slots: { default: true }
		});
	}
}