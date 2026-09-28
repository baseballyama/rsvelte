import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from './Nested.svelte';

var root = $.from_html(`<p slot="foo-bar">Hello</p>`);

export default function Main($$anchor) {
	Nested($$anchor, {
		$$slots: {
			'foo-bar': ($$anchor, $$slotProps) => {
				var p = root();

				$.append($$anchor, p);
			}
		}
	});
}