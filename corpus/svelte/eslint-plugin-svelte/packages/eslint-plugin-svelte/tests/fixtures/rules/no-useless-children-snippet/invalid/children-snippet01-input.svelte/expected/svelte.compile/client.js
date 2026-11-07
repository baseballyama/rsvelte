import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Children_snippet01_input($$anchor) {
	{
		const children = ($$anchor) => {
			$.next();

			var text = $.text('Hello');

			$.append($$anchor, text);
		};

		Foo($$anchor, { children, $$slots: { default: true } });
	}
}