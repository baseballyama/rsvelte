import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from './Nested.svelte';

var root = $.from_html(`<p slot="foo">foo</p>`);
var root_1 = $.from_html(`<p slot="bar">bar</p>`);

export default function Main($$anchor) {
	Nested($$anchor, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Hello');

			$.append($$anchor, text);
		},

		$$slots: {
			default: true,
			foo: ($$anchor, $$slotProps) => {
				var p = root();

				$.append($$anchor, p);
			},

			bar: ($$anchor, $$slotProps) => {
				var p_1 = root_1();

				$.append($$anchor, p_1);
			}
		}
	});
}