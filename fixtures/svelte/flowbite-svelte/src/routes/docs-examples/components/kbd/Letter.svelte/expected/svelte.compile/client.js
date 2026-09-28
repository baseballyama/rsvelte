import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Kbd } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Letter($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Kbd(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Q');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Kbd(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('W');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Kbd(node_2, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('E');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Kbd(node_3, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('R');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Kbd(node_4, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('T');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Kbd(node_5, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Y');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Kbd(node_6, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('U');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Kbd(node_7, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('I');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	Kbd(node_8, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_8 = $.text('O');

			$.append($$anchor, text_8);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	Kbd(node_9, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_9 = $.text('P');

			$.append($$anchor, text_9);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_9, 2);

	Kbd(node_10, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_10 = $.text('A');

			$.append($$anchor, text_10);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 2);

	Kbd(node_11, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_11 = $.text('S');

			$.append($$anchor, text_11);
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_11, 2);

	Kbd(node_12, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_12 = $.text('D');

			$.append($$anchor, text_12);
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_12, 2);

	Kbd(node_13, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_13 = $.text('F');

			$.append($$anchor, text_13);
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_13, 2);

	Kbd(node_14, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_14 = $.text('G');

			$.append($$anchor, text_14);
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node_14, 2);

	Kbd(node_15, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_15 = $.text('H');

			$.append($$anchor, text_15);
		},
		$$slots: { default: true }
	});

	var node_16 = $.sibling(node_15, 2);

	Kbd(node_16, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_16 = $.text('J');

			$.append($$anchor, text_16);
		},
		$$slots: { default: true }
	});

	var node_17 = $.sibling(node_16, 2);

	Kbd(node_17, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_17 = $.text('K');

			$.append($$anchor, text_17);
		},
		$$slots: { default: true }
	});

	var node_18 = $.sibling(node_17, 2);

	Kbd(node_18, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_18 = $.text('L');

			$.append($$anchor, text_18);
		},
		$$slots: { default: true }
	});

	var node_19 = $.sibling(node_18, 2);

	Kbd(node_19, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_19 = $.text('Z');

			$.append($$anchor, text_19);
		},
		$$slots: { default: true }
	});

	var node_20 = $.sibling(node_19, 2);

	Kbd(node_20, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_20 = $.text('X');

			$.append($$anchor, text_20);
		},
		$$slots: { default: true }
	});

	var node_21 = $.sibling(node_20, 2);

	Kbd(node_21, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_21 = $.text('C');

			$.append($$anchor, text_21);
		},
		$$slots: { default: true }
	});

	var node_22 = $.sibling(node_21, 2);

	Kbd(node_22, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_22 = $.text('V');

			$.append($$anchor, text_22);
		},
		$$slots: { default: true }
	});

	var node_23 = $.sibling(node_22, 2);

	Kbd(node_23, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_23 = $.text('B');

			$.append($$anchor, text_23);
		},
		$$slots: { default: true }
	});

	var node_24 = $.sibling(node_23, 2);

	Kbd(node_24, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_24 = $.text('N');

			$.append($$anchor, text_24);
		},
		$$slots: { default: true }
	});

	var node_25 = $.sibling(node_24, 2);

	Kbd(node_25, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_25 = $.text('M');

			$.append($$anchor, text_25);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}