import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Named_snippet01_input($$anchor) {
	{
		const bar = ($$anchor) => {
			$.next();

			var text = $.text('Hello');

			$.append($$anchor, text);
		};

		Foo($$anchor, { bar, $$slots: { bar: true } });
	}
}