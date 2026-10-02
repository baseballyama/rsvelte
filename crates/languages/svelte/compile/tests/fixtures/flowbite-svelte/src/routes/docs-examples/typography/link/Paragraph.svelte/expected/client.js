import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { A, P } from "flowbite-svelte";

var root = $.from_html(
	`The free updates that will be provided is based on the <!> that we have laid out for this project. It is also possible that we will provide extra
  updates outside of the roadmap as well.`,
	1
);

export default function Paragraph($$anchor) {
	P($$anchor, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();
			var node = $.sibling($.first_child(fragment_1));

			A(node, {
				href: '/',
				class: 'underline hover:no-underline',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('roadmap');

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