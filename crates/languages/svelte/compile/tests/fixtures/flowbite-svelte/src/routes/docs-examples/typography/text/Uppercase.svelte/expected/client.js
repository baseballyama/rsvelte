import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { P, Span } from "flowbite-svelte";

var root = $.from_html(`The crypto <!> primitive.`, 1);

export default function Uppercase($$anchor) {
	P($$anchor, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();
			var node = $.sibling($.first_child(fragment_1));

			Span(node, {
				class: 'uppercase',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('identity');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}