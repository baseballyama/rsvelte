import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Snippet_with_params01_input($$anchor) {
	{
		const children = ($$anchor, val = $.noop) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, `Hello ${val() ?? ''}`));
			$.append($$anchor, text);
		};

		Foo($$anchor, { children, $$slots: { default: true } });
	}
}