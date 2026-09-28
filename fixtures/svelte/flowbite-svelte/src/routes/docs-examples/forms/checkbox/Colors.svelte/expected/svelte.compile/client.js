import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox, Label } from "flowbite-svelte";

var root = $.from_html(`<!> Your custom color`, 1);
var root_1 = $.from_html(`<div class="flex flex-col gap-4 sm:flex-row"><!> <!> <!> <!> <!> <!> <!></div>`);

export default function Colors($$anchor) {
	var div = root_1();
	var node = $.child(div);

	Checkbox(node, {
		checked: true,
		color: 'red',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Red');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Checkbox(node_1, {
		checked: true,
		color: 'green',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Green');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Checkbox(node_2, {
		checked: true,
		color: 'purple',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Purple');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Checkbox(node_3, {
		checked: true,
		color: 'teal',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Teal');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Checkbox(node_4, {
		checked: true,
		color: 'yellow',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Yellow');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Checkbox(node_5, {
		checked: true,
		color: 'orange',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Orange');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Label(node_6, {
		class: 'flex items-center',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_7 = $.first_child(fragment);

			Checkbox(node_7, {
				checked: true,
				inline: true,
				class: 'text-sky-400 focus:ring-pink-500'
			});

			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}