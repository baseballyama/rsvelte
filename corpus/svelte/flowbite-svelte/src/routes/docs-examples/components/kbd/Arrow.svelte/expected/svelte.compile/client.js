import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Kbd } from "flowbite-svelte";

import {
	CaretUpSolid,
	CaretDownSolid,
	CaretRightSolid,
	CaretLeftSolid
} from "flowbite-svelte-icons";

var root = $.from_html(`<!> <span class="sr-only">Arrow key up</span>`, 1);
var root_1 = $.from_html(`<!> <span class="sr-only">Arrow key down</span>`, 1);
var root_2 = $.from_html(`<!> <span class="sr-only">Arrow key left</span>`, 1);
var root_3 = $.from_html(`<!> <span class="sr-only">Arrow key right</span>`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Arrow($$anchor) {
	var fragment = root_4();
	var node = $.first_child(fragment);

	Kbd(node, {
		class: 'me-1 inline-flex items-center px-2 py-1.5',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			CaretUpSolid(node_1, {});
			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	Kbd(node_2, {
		class: 'me-1 inline-flex items-center px-2 py-1.5',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();
			var node_3 = $.first_child(fragment_2);

			CaretDownSolid(node_3, {});
			$.next(2);
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_2, 2);

	Kbd(node_4, {
		class: 'me-1 inline-flex items-center px-2 py-1.5',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_2();
			var node_5 = $.first_child(fragment_3);

			CaretLeftSolid(node_5, {});
			$.next(2);
			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_4, 2);

	Kbd(node_6, {
		class: 'me-1 inline-flex items-center px-2 py-1.5',
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root_3();
			var node_7 = $.first_child(fragment_4);

			CaretRightSolid(node_7, {});
			$.next(2);
			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}