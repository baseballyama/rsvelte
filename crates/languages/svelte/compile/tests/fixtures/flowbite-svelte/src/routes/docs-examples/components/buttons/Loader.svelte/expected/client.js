import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Spinner } from "flowbite-svelte";

var root = $.from_html(`<!>Loading ...`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Loader($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Button(node, {
		loading: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Loading ...');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		loading: true,
		spinnerProps: { size: "4", color: "green" },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Loading ...');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_3 = $.first_child(fragment_1);

			Spinner(node_3, { class: 'me-3', size: '4', color: 'gray' });
			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_2, 2);

	Button(node_4, {
		color: 'alternative',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_5 = $.first_child(fragment_2);

			Spinner(node_5, { class: 'me-3', size: '4' });
			$.next();
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}