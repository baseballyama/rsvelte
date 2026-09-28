import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from './Nested.svelte';

var root = $.from_html(`<span> </span>`);

export default function Main($$anchor) {
	Nested($$anchor, {
		$$slots: {
			main: ($$anchor, $$slotProps) => {
				const c = $.derived(() => $$slotProps.c);
				const count = $.derived(() => $$slotProps.count);
				var span = root();
				var text = $.only_child(span);

				$.template_effect(() => $.set_text(text, `${$.get(c) ?? ''} (${$.get(count) ?? ''})`));
				$.append($$anchor, span);
			}
		}
	});
}