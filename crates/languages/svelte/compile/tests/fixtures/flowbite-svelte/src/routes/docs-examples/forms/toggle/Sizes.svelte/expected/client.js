import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toggle } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Sizes($$anchor) {
	const customSize = "w-16 h-10 after:top-1 after:left-[4px]  after:h-8 after:w-8";
	var fragment = root();
	var node = $.first_child(fragment);

	Toggle(node, {
		size: 'small',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Small toggle');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Toggle(node_1, {
		size: 'default',
		checked: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Default toggle');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Toggle(node_2, {
		size: 'large',
		checked: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Large toggle');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Toggle(node_3, {
		size: undefined,
		classes: { span: customSize },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Custom toggle');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}