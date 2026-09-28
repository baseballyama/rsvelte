import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input, Label } from "flowbite-svelte";

var root = $.from_html(`<div>Small icon input</div> <!>`, 1);
var root_1 = $.from_html(`<div>Default icon input</div> <!>`, 1);
var root_2 = $.from_html(`<div>Large icon input</div> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function Sizes($$anchor) {
	var fragment = root_3();
	var node = $.first_child(fragment);

	Label(node, {
		class: 'space-y-2',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.sibling($.first_child(fragment_1), 2);

			Input(node_1, { type: 'email', placeholder: 'Small input', size: 'sm' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	Label(node_2, {
		class: 'space-y-2',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();
			var node_3 = $.sibling($.first_child(fragment_2), 2);

			Input(node_3, { type: 'email', placeholder: 'Default input', size: 'md' });
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_2, 2);

	Label(node_4, {
		class: 'space-y-2',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_2();
			var node_5 = $.sibling($.first_child(fragment_3), 2);

			Input(node_5, { type: 'email', placeholder: 'Large input', size: 'lg' });
			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}