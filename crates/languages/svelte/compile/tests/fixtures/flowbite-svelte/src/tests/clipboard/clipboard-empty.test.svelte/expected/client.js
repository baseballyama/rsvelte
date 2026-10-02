import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Clipboard } from "$lib";

export default function Clipboard_empty_test($$anchor) {
	{
		const children = ($$anchor, success = $.noop) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, success() ? "Copied!" : "Copy Empty"));
			$.append($$anchor, text);
		};

		Clipboard($$anchor, {
			value: '',
			'data-testid': 'empty-button',
			children,
			$$slots: { default: true }
		});
	}
}