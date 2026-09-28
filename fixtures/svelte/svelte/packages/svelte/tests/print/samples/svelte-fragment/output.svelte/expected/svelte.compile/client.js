import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Widget from './Widget.svelte';

var root = $.from_html(`<h1 slot="header">Hello</h1>`);
var root_1 = $.from_html(`<p>All rights reserved.</p> <p>Copyright (c) 2019 Svelte Industries</p>`, 1);

export default function Output($$anchor) {
	Widget($$anchor, {
		$$slots: {
			header: ($$anchor, $$slotProps) => {
				var h1 = root();

				$.append($$anchor, h1);
			},

			footer: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();

				$.next(2);
				$.append($$anchor, fragment_1);
			}
		}
	});
}