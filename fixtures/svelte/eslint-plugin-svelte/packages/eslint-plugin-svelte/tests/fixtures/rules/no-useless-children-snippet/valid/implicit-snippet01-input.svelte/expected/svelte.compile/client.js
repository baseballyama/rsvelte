import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Implicit_snippet01_input($$anchor) {
	Foo($$anchor, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Hello');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}