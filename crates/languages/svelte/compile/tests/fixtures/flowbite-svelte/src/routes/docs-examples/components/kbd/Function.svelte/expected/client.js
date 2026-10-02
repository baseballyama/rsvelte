import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Kbd } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Function($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Kbd(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('F1');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Kbd(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('F2');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Kbd(node_2, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('F3');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Kbd(node_3, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('F4');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Kbd(node_4, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('F5');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Kbd(node_5, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('F6');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Kbd(node_6, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('F7');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Kbd(node_7, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('F8');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	Kbd(node_8, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_8 = $.text('F9');

			$.append($$anchor, text_8);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	Kbd(node_9, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_9 = $.text('F10');

			$.append($$anchor, text_9);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_9, 2);

	Kbd(node_10, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_10 = $.text('F11');

			$.append($$anchor, text_10);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 2);

	Kbd(node_11, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_11 = $.text('F12');

			$.append($$anchor, text_11);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}