import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Clipboard } from "$lib";

export default function Clipboard_embedded_test($$anchor) {
	{
		const children = ($$anchor, success = $.noop) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, success() ? "Copied!" : "Copy Embedded"));
			$.append($$anchor, text);
		};

		Clipboard($$anchor, {
			value: 'test',
			embedded: true,
			'data-testid': 'embedded-button',
			children,
			$$slots: { default: true }
		});
	}
}