import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { List, Li, Heading } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Lists($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Heading(node, {
		tag: 'h5',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('List disc');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	List(node_1, {
		class: 'list-disc',
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

			var text_4 = $.text('List decimal');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	List(node_6, {
		class: 'list-decimal',
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

	var node_10 = $.sibling(node_6, 2);

	Heading(node_10, {
		tag: 'h5',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_8 = $.text('List none');

			$.append($$anchor, text_8);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 2);

	List(node_11, {
		class: 'list-none',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root();
			var node_12 = $.first_child(fragment_3);

			Li(node_12, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_9 = $.text('Design');

					$.append($$anchor, text_9);
				},
				$$slots: { default: true }
			});

			var node_13 = $.sibling(node_12, 2);

			Li(node_13, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_10 = $.text('Develop');

					$.append($$anchor, text_10);
				},
				$$slots: { default: true }
			});

			var node_14 = $.sibling(node_13, 2);

			Li(node_14, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_11 = $.text('Test');

					$.append($$anchor, text_11);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}