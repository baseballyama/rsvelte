import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Outer from './outer.svelte';

var root = $.from_html(`<div slot="x"> </div>`);

export default function Main($$anchor) {
	Outer($$anchor, {
		$$slots: {
			x: ($$anchor, $$slotProps) => {
				const foo = $.derived(() => $$slotProps.foo);
				var div = root();
				var text = $.only_child(div, true);

				$.template_effect(() => $.set_text(text, $.get(foo)));
				$.append($$anchor, div);
			}
		}
	});
}