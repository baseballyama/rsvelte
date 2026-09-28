import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Chip from "components/Chip";
import Button from "components/Button";
import Snackbar from "components/Snackbar";
import Code from "docs/Code.svelte";
import chip from "examples/chip.txt";
import chipOutlined from "examples/chip-outlined.txt";

var root = $.from_html(`<div slot="action"><!></div>`);
var root_1 = $.from_html(`<h5 class="mt-6 mb-2">Basic</h5> <!> <div class="my-4"><!></div> <h5 class="mt-6 mb-2">Outlined</h5> <!> <!> <!> <!> <div class="my-4"><!></div> <!> <!>`, 1);

export default function Chips($$anchor) {
	let closed = false;
	let clicked = false;
	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 2);

	Chip(node, {
		icon: 'face',
		selectable: true,
		$$events: { close: () => closed = true, click: () => clicked = true },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('test');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	Code(node_1, {
		get code() {
			return chip;
		}
	});

	$.reset(div);

	var node_2 = $.sibling(div, 4);

	Chip(node_2, {
		icon: 'pan_tool',
		outlined: true,
		removable: true,
		selectable: true,
		$$events: { close: () => closed = true, click: () => clicked = true },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Cats');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Chip(node_3, {
		icon: 'print',
		outlined: true,
		removable: true,
		selectable: true,
		color: 'blue',
		$$events: { close: () => closed = true, click: () => clicked = true },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Dogs');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Chip(node_4, {
		icon: 'pageview',
		outlined: true,
		removable: true,
		selectable: true,
		color: 'alert',
		$$events: { close: () => closed = true, click: () => clicked = true },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Plants');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Chip(node_5, {
		icon: 'pets',
		outlined: true,
		removable: true,
		selectable: true,
		color: 'secondary',
		$$events: { close: () => closed = true, click: () => clicked = true },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Parents');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node_5, 2);
	var node_6 = $.child(div_1);

	Code(node_6, {
		lang: 'javascript',
		get code() {
			return chipOutlined;
		}
	});

	$.reset(div_1);

	var node_7 = $.sibling(div_1, 2);

	Snackbar(node_7, {
		get value() {
			return closed;
		},

		set value($$value) {
			closed = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Chip was removed successfully.');

			$.append($$anchor, text_5);
		},

		$$slots: {
			default: true,
			action: ($$anchor, $$slotProps) => {
				var div_2 = root();
				var node_8 = $.child(div_2);

				Button(node_8, {
					text: true,
					$$events: { click: () => closed = false },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_6 = $.text('Dismiss');

						$.append($$anchor, text_6);
					},
					$$slots: { default: true }
				});

				$.reset(div_2);
				$.append($$anchor, div_2);
			}
		}
	});

	var node_9 = $.sibling(node_7, 2);

	Snackbar(node_9, {
		get value() {
			return clicked;
		},

		set value($$value) {
			clicked = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('Chip was clicked successfully.');

			$.append($$anchor, text_7);
		},

		$$slots: {
			default: true,
			action: ($$anchor, $$slotProps) => {
				var div_3 = root();
				var node_10 = $.child(div_3);

				Button(node_10, {
					text: true,
					$$events: { click: () => clicked = false },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_8 = $.text('Dismiss');

						$.append($$anchor, text_8);
					},
					$$slots: { default: true }
				});

				$.reset(div_3);
				$.append($$anchor, div_3);
			}
		}
	});

	$.append($$anchor, fragment);
}