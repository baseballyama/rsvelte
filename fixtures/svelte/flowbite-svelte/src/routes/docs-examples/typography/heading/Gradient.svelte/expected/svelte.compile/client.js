import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Heading, P, Span } from "flowbite-svelte";

var root = $.from_html(`<!> Scalable AI.`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Gradient($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Heading(node, {
		tag: 'h1',
		class: 'mb-4 text-3xl font-extrabold  md:text-5xl lg:text-6xl',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Span(node_1, {
				gradient: 'tealToLime',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Better Data');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	P(node_2, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Here at Flowbite we focus on markets where technology, innovation, and capital can unlock long-term value and drive economic growth.');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}