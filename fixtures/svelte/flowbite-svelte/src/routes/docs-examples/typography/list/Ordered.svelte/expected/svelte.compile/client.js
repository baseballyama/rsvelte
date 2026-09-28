import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { List, Li, Span, Heading } from "flowbite-svelte";

var root = $.from_html(`<!> with <!> points`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Ordered($$anchor) {
	var fragment = root_2();
	var node = $.first_child(fragment);

	Heading(node, {
		tag: 'h2',
		class: 'mb-2 text-lg font-semibold  text-gray-900 dark:text-white',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Top students:');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	List(node_1, {
		tag: 'ol',
		class: 'space-y-1 text-gray-500 dark:text-gray-400',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_2 = $.first_child(fragment_1);

			Li(node_2, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_3 = $.first_child(fragment_2);

					Span(node_3, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Bonnie Green');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					Span(node_4, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('70');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.next();
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_2, 2);

			Li(node_5, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_6 = $.first_child(fragment_3);

					Span(node_6, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Jese Leos');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					Span(node_7, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('63');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					$.next();
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_5, 2);

			Li(node_8, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root();
					var node_9 = $.first_child(fragment_4);

					Span(node_9, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Leslie Livingston');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					var node_10 = $.sibling(node_9, 2);

					Span(node_10, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('57');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});

					$.next();
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}