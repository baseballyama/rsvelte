import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from './Nested.svelte';

var root = $.from_html(`<p> </p>`);

export default function Main($$anchor) {
	Nested($$anchor, {
		$$slots: {
			main: ($$anchor, $$slotProps) => {
				const bar = $.derived(() => $$slotProps.foo);
				var p = root();
				var text = $.only_child(p, true);

				$.template_effect(() => $.set_text(text, $.get(bar)));
				$.append($$anchor, p);
			}
		}
	});
}