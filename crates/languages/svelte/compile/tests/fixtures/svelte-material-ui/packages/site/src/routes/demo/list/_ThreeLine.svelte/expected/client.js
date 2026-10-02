import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import List, { Item, Text, PrimaryText, SecondaryText } from '@smui/list';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div><!></div>`);

export default function _ThreeLine($$anchor) {
	var div = root_1();
	var node = $.child(div);

	List(node, {
		threeLine: true,
		nonInteractive: true,
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Item(node_1, {
				children: ($$anchor, $$slotProps) => {
					Text($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							PrimaryText(node_2, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('FruitPhone Pro');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							var node_3 = $.sibling(node_2, 2);

							SecondaryText(node_3, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('$1,000');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_4 = $.sibling(node_3, 2);

							SecondaryText(node_4, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('A beautiful phone with good specs.');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_1, 2);

			Item(node_5, {
				children: ($$anchor, $$slotProps) => {
					Text($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root();
							var node_6 = $.first_child(fragment_4);

							PrimaryText(node_6, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Robot Phone Max');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							var node_7 = $.sibling(node_6, 2);

							SecondaryText(node_7, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('$700');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							var node_8 = $.sibling(node_7, 2);

							SecondaryText(node_8, {
								title: 'Pretty much the same phone, but a different brand name and OS. It spies on you more, too.',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Pretty much the same phone, but a different brand name and OS. It\n          spies on you more, too.');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_5, 2);

			Item(node_9, {
				children: ($$anchor, $$slotProps) => {
					Text($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root();
							var node_10 = $.first_child(fragment_6);

							PrimaryText(node_10, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text('Penguin Phone');

									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});

							var node_11 = $.sibling(node_10, 2);

							SecondaryText(node_11, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text('$220');

									$.append($$anchor, text_7);
								},
								$$slots: { default: true }
							});

							var node_12 = $.sibling(node_11, 2);

							SecondaryText(node_12, {
								title: 'A very weak phone that you can install literally anything on. Compile your own kernel, you nerd. :D',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('A very weak phone that you can install literally anything on. Compile\n          your own kernel, you nerd. :D');

									$.append($$anchor, text_8);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}