import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import List, { Group, Item, Subheader, Text } from '@smui/list';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="svelte-ba8yce"><!></div> <pre class="status svelte-ba8yce"> </pre>`, 1);

export default function _Groups($$anchor) {
	let clicked = $.state('nothing yet');
	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Group(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			Subheader(node_1, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Actors');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			List(node_2, {
				class: 'demo-list',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_3 = $.first_child(fragment_2);

					Item(node_3, {
						onSMUIAction: () => $.set(clicked, 'Bruce Willis'),
						children: ($$anchor, $$slotProps) => {
							Text($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Bruce Willis');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					Item(node_4, {
						onSMUIAction: () => $.set(clicked, 'Tom Hanks'),
						children: ($$anchor, $$slotProps) => {
							Text($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Tom Hanks');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					Item(node_5, {
						onSMUIAction: () => $.set(clicked, 'Jack Nicholson'),
						children: ($$anchor, $$slotProps) => {
							Text($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Jack Nicholson');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					Item(node_6, {
						onSMUIAction: () => $.set(clicked, 'Leonardo DiCaprio'),
						children: ($$anchor, $$slotProps) => {
							Text($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Leonardo DiCaprio');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					Item(node_7, {
						onSMUIAction: () => $.set(clicked, 'Matt Damon'),
						children: ($$anchor, $$slotProps) => {
							Text($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Matt Damon');

									$.append($$anchor, text_5);
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

			var node_8 = $.sibling(node_2, 2);

			Subheader(node_8, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('Books');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_8, 2);

			List(node_9, {
				class: 'demo-list',
				children: ($$anchor, $$slotProps) => {
					var fragment_8 = root();
					var node_10 = $.first_child(fragment_8);

					Item(node_10, {
						onSMUIAction: () => $.set(clicked, 'To Kill a Mockingbird'),
						children: ($$anchor, $$slotProps) => {
							Text($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text('To Kill a Mockingbird');

									$.append($$anchor, text_7);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_11 = $.sibling(node_10, 2);

					Item(node_11, {
						onSMUIAction: () => $.set(clicked, 'The Great Gatsby'),
						children: ($$anchor, $$slotProps) => {
							Text($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('The Great Gatsby');

									$.append($$anchor, text_8);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_12 = $.sibling(node_11, 2);

					Item(node_12, {
						onSMUIAction: () => $.set(clicked, '1984'),
						children: ($$anchor, $$slotProps) => {
							Text($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_9 = $.text('1984');

									$.append($$anchor, text_9);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_13 = $.sibling(node_12, 2);

					Item(node_13, {
						onSMUIAction: () => $.set(clicked, 'Catch-22'),
						children: ($$anchor, $$slotProps) => {
							Text($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_10 = $.text('Catch-22');

									$.append($$anchor, text_10);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_14 = $.sibling(node_13, 2);

					Item(node_14, {
						onSMUIAction: () => $.set(clicked, "Alice's Adventures in Wonderland"),
						children: ($$anchor, $$slotProps) => {
							Text($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_11 = $.text('Alice\'s Adventures in Wonderland');

									$.append($$anchor, text_11);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_8);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var pre = $.sibling(div, 2);
	var text_12 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_12, `Clicked: ${$.get(clicked) ?? ''}`));
	$.append($$anchor, fragment);
}