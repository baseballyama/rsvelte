import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { List, Li, Span } from "flowbite-svelte";
import { CheckOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<!> Individual configuration`, 1);
var root_1 = $.from_html(`<!> No setup, or hidden fees`, 1);
var root_2 = $.from_html(`<!> <span>Team size: <!></span>`, 1);
var root_3 = $.from_html(`<!> <span>Premium support: <!></span>`, 1);
var root_4 = $.from_html(`<!> <span>Free updates: <!></span>`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Icon($$anchor) {
	List($$anchor, {
		tag: 'ul',
		class: 'mb-8 space-y-4 text-gray-500 dark:text-gray-400',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_5();
			var node = $.first_child(fragment_1);

			Li(node, {
				icon: true,
				class: 'gap-3',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					CheckOutline(node_1, { class: 'h-5 w-5 text-green-500 dark:text-green-400' });
					$.next();
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node, 2);

			Li(node_2, {
				icon: true,
				class: 'gap-3',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_3 = $.first_child(fragment_3);

					CheckOutline(node_3, { class: 'h-5 w-5 text-green-500 dark:text-green-400' });
					$.next();
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_2, 2);

			Li(node_4, {
				icon: true,
				class: 'gap-3',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_2();
					var node_5 = $.first_child(fragment_4);

					CheckOutline(node_5, { class: 'h-5 w-5 text-green-500 dark:text-green-400' });

					var span = $.sibling(node_5, 2);
					var node_6 = $.sibling($.child(span));

					Span(node_6, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('1 developer');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					$.reset(span);
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_4, 2);

			Li(node_7, {
				icon: true,
				class: 'gap-3',
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root_3();
					var node_8 = $.first_child(fragment_5);

					CheckOutline(node_8, { class: 'h-5 w-5 text-green-500 dark:text-green-400' });

					var span_1 = $.sibling(node_8, 2);
					var node_9 = $.sibling($.child(span_1));

					Span(node_9, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('6 months');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.reset(span_1);
					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_7, 2);

			Li(node_10, {
				icon: true,
				class: 'gap-3',
				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root_4();
					var node_11 = $.first_child(fragment_6);

					CheckOutline(node_11, { class: 'h-5 w-5 text-green-500 dark:text-green-400' });

					var span_2 = $.sibling(node_11, 2);
					var node_12 = $.sibling($.child(span_2));

					Span(node_12, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('6 months');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.reset(span_2);
					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}