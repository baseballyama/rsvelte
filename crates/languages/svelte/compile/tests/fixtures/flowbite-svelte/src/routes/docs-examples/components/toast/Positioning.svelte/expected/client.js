import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toast } from "flowbite-svelte";

var root = $.from_html(`<div class="relative h-56"><!> <!> <!> <!></div>`);

export default function Positioning($$anchor) {
	var div = root();
	var node = $.child(div);

	Toast(node, {
		dismissable: false,
		position: 'top-left',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Top left positioning.');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Toast(node_1, {
		dismissable: false,
		position: 'top-right',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Top right positioning.');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Toast(node_2, {
		dismissable: false,
		position: 'bottom-left',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Bottom left positioning.');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Toast(node_3, {
		dismissable: false,
		position: 'bottom-right',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Bottom right positioning.');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}