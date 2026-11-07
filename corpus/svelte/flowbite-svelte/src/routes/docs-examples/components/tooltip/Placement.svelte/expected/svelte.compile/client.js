import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tooltip, Button } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Placement($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Tooltip left');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Tooltip(node_1, {
		placement: 'left',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Left');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Tooltip top');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Tooltip(node_3, {
		placement: 'top',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Top');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Button(node_4, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Tooltip bottom');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Tooltip(node_5, {
		placement: 'bottom',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Bottom');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Button(node_6, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Tooltip right');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Tooltip(node_7, {
		placement: 'right',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('Right');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}