import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ThemeProvider, Heading, P, Card } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Theme1($$anchor) {
	const theme1a = {
		card: { base: "bg-blue-50 border-blue-200 p-4" },
		heading: "text-3xl text-blue-500",
		p: "text-blue-500 text-lg"
	};

	const theme1b = { heading: "text-lg text-purple-600 font-bold" };
	const theme1c = { paragraph: "text-gray-600 italic text-md" };

	ThemeProvider($$anchor, {
		get theme() {
			return theme1a;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Heading(node, {
				tag: 'h1',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Blue Heading');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			P(node_1, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Card example');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Card(node_2, {
				href: '/cards',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_3 = $.first_child(fragment_2);

					ThemeProvider(node_3, {
						get theme() {
							return theme1b;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_4 = $.first_child(fragment_3);

							Heading(node_4, {
								tag: 'h2',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Purple Heading');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							var node_5 = $.sibling(node_4, 2);

							Heading(node_5, {
								tag: 'h3',
								class: 'text-green-400',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Green heading');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_3, 2);

					ThemeProvider(node_6, {
						get theme() {
							return theme1c;
						},

						children: ($$anchor, $$slotProps) => {
							P($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}