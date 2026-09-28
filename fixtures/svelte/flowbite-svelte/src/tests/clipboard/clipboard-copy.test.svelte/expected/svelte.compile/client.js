import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Clipboard } from "$lib";

export default function Clipboard_copy_test($$anchor) {
	{
		const children = ($$anchor, success = $.noop) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, success() ? "Copied!" : "Copy"));
			$.append($$anchor, text);
		};

		Clipboard($$anchor, {
			value: 'Hello, World!',
			'data-testid': 'copy-button',
			children,
			$$slots: { default: true }
		});
	}
}