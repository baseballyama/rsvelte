import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { P, Span } from "flowbite-svelte";

var root = $.from_html(`Track work across the enterprise through an open, collaborative platform. <!> and ingest data from other <!> tools, so your IT support and operations teams have richer contextual information to rapidly respond to <!>, <!>, and <!>.`, 1);
var root_1 = $.from_html(`The crypto <!> primitive.`, 1);
var root_2 = $.from_html(`<!> <!><!> <!>`, 1);

export default function TextDecoration($$anchor) {
	var fragment = root_2();
	var node = $.first_child(fragment);

	P(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();
			var node_1 = $.sibling($.first_child(fragment_1));

			Span(node_1, {
				underline: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Link issues across Jira');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Span(node_2, {
				underline: true,
				class: 'decoration-blue-500 decoration-double',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('software development');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Span(node_3, {
				underline: true,
				class: 'decoration-green-500 decoration-dotted',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('requests');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Span(node_4, {
				underline: true,
				class: 'decoration-red-500 decoration-dashed decoration-4',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('incidents');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Span(node_5, {
				underline: true,
				class: 'decoration-sky-500 decoration-wavy',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('changes');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node, 2);

	Span(node_6, {
		class: 'line-through',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('$109');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6);

	Span(node_7, {
		class: 'ms-3',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('$79');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	P(node_8, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_2 = root_1();
			var node_9 = $.sibling($.first_child(fragment_2));

			Span(node_9, {
				class: 'uppercase',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('identity');

					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});

			$.next();
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}