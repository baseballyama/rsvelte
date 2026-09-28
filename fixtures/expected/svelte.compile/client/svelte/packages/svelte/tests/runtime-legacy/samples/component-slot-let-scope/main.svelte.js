import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from './Nested.svelte';

var root = $.from_html(`<span></span>`);

export default function Main($$anchor) {
	Nested($$anchor, {
		$$slots: {
			thing: ($$anchor, $$slotProps) => {
				var span = root();

				span.textContent = thing;
				$.append($$anchor, span);
			}
		}
	});
}