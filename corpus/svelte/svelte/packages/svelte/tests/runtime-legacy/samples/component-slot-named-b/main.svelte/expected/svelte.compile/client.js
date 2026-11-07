import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from './Nested.svelte';

var root = $.from_html(`<span slot="name"></span>`);

export default function Main($$anchor) {
	let name = 'world';

	Nested($$anchor, {
		$$slots: {
			name: ($$anchor, $$slotProps) => {
				var span = root();

				span.textContent = 'Hello world';
				$.append($$anchor, span);
			}
		}
	});
}