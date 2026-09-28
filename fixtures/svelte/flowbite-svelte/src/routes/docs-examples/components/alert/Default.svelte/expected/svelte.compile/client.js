import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Alert } from "flowbite-svelte";

var root = $.from_html(`<span class="font-medium">Default alert!</span> Change a few things up and try submitting again.`, 1);
var root_1 = $.from_html(`<span class="font-medium">Info alert!</span> Change a few things up and try submitting again.`, 1);
var root_2 = $.from_html(`<span class="font-medium">Danger alert!</span> Change a few things up and try submitting again.`, 1);
var root_3 = $.from_html(`<span class="font-medium">Success alert!</span> Change a few things up and try submitting again.`, 1);
var root_4 = $.from_html(`<span class="font-medium">Warning alert!</span> Change a few things up and try submitting again.`, 1);
var root_5 = $.from_html(`<span class="font-medium">Dark alert!</span> Change a few things up and try submitting again.`, 1);
var root_6 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Default($$anchor) {
	var fragment = root_6();
	var node = $.first_child(fragment);

	Alert(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Alert(node_1, {
		color: 'blue',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();

			$.next();
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Alert(node_2, {
		color: 'red',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_2();

			$.next();
			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Alert(node_3, {
		color: 'green',
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root_3();

			$.next();
			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Alert(node_4, {
		color: 'yellow',
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_4();

			$.next();
			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Alert(node_5, {
		color: 'secondary',
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root_5();

			$.next();
			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}