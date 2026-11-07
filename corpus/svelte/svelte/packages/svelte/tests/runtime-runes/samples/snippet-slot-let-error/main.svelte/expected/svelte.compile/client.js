import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inner from './inner.svelte';

export default function Main($$anchor) {
	Inner($$anchor, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const foo = $.derived(() => $$slotProps.foo);

				$.next();

				var text = $.text();

				$.template_effect(() => $.set_text(text, $.get(foo)));
				$.append($$anchor, text);
			}
		}
	});
}