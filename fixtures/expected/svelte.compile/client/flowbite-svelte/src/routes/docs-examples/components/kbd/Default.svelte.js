import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Kbd } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Default($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Kbd(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Shift');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Kbd(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Ctrl');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Kbd(node_2, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Tab');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Kbd(node_3, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Caps Lock');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Kbd(node_4, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Esc');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Kbd(node_5, {
		class: 'px-4',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Spacebar');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Kbd(node_6, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Enter');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}