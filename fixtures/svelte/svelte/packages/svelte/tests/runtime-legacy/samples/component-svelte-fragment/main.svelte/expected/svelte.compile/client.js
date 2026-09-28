import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from "./Nested.svelte";
import B from './B.svelte';

var root = $.from_html(`content <span></span>`, 1);

export default function Main($$anchor) {
	const a = 'a';

	Nested($$anchor, {
		$$slots: {
			a: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var span = $.sibling($.first_child(fragment_1));

				span.textContent = 'a';
				$.append($$anchor, fragment_1);
			},

			b: ($$anchor, $$slotProps) => {
				B($$anchor, { name: 'world' });
			}
		}
	});
}