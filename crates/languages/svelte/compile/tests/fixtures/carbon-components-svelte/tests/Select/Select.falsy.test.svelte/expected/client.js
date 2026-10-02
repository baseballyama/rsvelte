import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Select from "carbon-components-svelte/Select/Select.svelte";
import SelectItem from "carbon-components-svelte/Select/SelectItem.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Select_falsy_test($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Select(node, {
		labelText: 'Falsy text',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			SelectItem(node_1, { value: -1, text: '' });

			var node_2 = $.sibling(node_1, 2);

			SelectItem(node_2, { value: 0, text: 'Zero' });

			var node_3 = $.sibling(node_2, 2);

			SelectItem(node_3, { value: 1, text: 'One' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node, 2);

	Select(node_4, {
		labelText: 'Undefined text',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_5 = $.first_child(fragment_2);

			SelectItem(node_5, { value: 2 });

			var node_6 = $.sibling(node_5, 2);

			SelectItem(node_6, { value: 0, text: 'Zero' });

			var node_7 = $.sibling(node_6, 2);

			SelectItem(node_7, { value: 1, text: 'One' });
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}