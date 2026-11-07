import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { List, Li, Heading } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function ListPosition($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Heading(node, {
		tag: 'h5',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('List inside');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	List(node_1, {
		position: 'inside',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			Li(node_2, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Design');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Li(node_3, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Develop');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Li(node_4, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Test');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_1, 2);

	Heading(node_5, {
		tag: 'h5',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('List outside');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	List(node_6, {
		position: 'outside',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_7 = $.first_child(fragment_2);

			Li(node_7, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Design');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_7, 2);

			Li(node_8, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('Develop');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_8, 2);

			Li(node_9, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('Test');

					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}