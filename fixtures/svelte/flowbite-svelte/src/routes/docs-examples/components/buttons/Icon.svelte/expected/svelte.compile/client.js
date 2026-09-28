import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "flowbite-svelte";
import { ArrowRightOutline, CartSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<!> Buy Now`, 1);
var root_1 = $.from_html(`Choose Plan <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Icon($$anchor) {
	var fragment = root_2();
	var node = $.first_child(fragment);

	Button(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			CartSolid(node_1, { class: 'me-2 h-5 w-5' });
			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	Button(node_2, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_2 = root_1();
			var node_3 = $.sibling($.first_child(fragment_2));

			ArrowRightOutline(node_3, { class: 'ms-2 h-5 w-5' });
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}