import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { A, P } from "flowbite-svelte";
import { ArrowRightOutline } from "flowbite-svelte-icons";

var root = $.from_html(`Read their stories <!>`, 1);
var root_1 = $.from_html(`500,000 people have made over a million apps with Glide. <!>`, 1);

export default function Icon($$anchor) {
	P($$anchor, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root_1();
			var node = $.sibling($.first_child(fragment_1));

			A(node, {
				href: '/',
				color: 'primary',
				class: 'inline-flex items-center font-medium  hover:underline',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_2 = root();
					var node_1 = $.sibling($.first_child(fragment_2));

					ArrowRightOutline(node_1, { class: 'ms-2 h-6 w-6' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}