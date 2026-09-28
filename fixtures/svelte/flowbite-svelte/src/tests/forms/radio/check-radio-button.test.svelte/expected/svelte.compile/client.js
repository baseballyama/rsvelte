import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RadioButton } from "$lib";

var root = $.from_html(`<!> <!>`, 1);

export default function Check_radio_button_test($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	RadioButton(node, {
		name: 'test',
		value: 'A',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('A');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	RadioButton(node_1, {
		name: 'test',
		value: 'B',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('B');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}