import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Drawer, { AppContent, Content } from '@smui/drawer';
import List, { Item, Text } from '@smui/list';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<main class="main-content svelte-cpv5i1">App content. <br class="svelte-cpv5i1"/> <pre class="status svelte-cpv5i1"> </pre></main>`);
var root_2 = $.from_html(`<div class="drawer-container svelte-cpv5i1"><!> <!></div>`);

export default function _Permanent($$anchor) {
	let clicked = $.state('nothing yet');
	var div = root_2();
	var node = $.child(div);

	Drawer(node, {
		children: ($$anchor, $$slotProps) => {
			Content($$anchor, {
				children: ($$anchor, $$slotProps) => {
					List($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_1 = $.first_child(fragment_2);

							Item(node_1, {
								href: 'javascript:void(0)',
								onclick: () => $.set(clicked, 'Gray Kittens'),
								children: ($$anchor, $$slotProps) => {
									Text($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('Gray Kittens');

											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							var node_2 = $.sibling(node_1, 2);

							Item(node_2, {
								href: 'javascript:void(0)',
								onclick: () => $.set(clicked, 'A Space Rocket'),
								children: ($$anchor, $$slotProps) => {
									Text($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('A Space Rocket');

											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							var node_3 = $.sibling(node_2, 2);

							Item(node_3, {
								href: 'javascript:void(0)',
								onclick: () => $.set(clicked, '100 Pounds of Gravel'),
								children: ($$anchor, $$slotProps) => {
									Text($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('100 Pounds of Gravel');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							var node_4 = $.sibling(node_3, 2);

							Item(node_4, {
								href: 'javascript:void(0)',
								onclick: () => $.set(clicked, 'All of the Shrimp'),
								children: ($$anchor, $$slotProps) => {
									Text($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('All of the Shrimp');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							var node_5 = $.sibling(node_4, 2);

							Item(node_5, {
								href: 'javascript:void(0)',
								onclick: () => $.set(clicked, 'A Planet with a Mall'),
								children: ($$anchor, $$slotProps) => {
									Text($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_4 = $.text('A Planet with a Mall');

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
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node, 2);

	AppContent(node_6, {
		class: 'app-content',
		children: ($$anchor, $$slotProps) => {
			var main = root_1();
			var pre = $.sibling($.child(main), 3);
			var text_5 = $.only_child(pre);

			$.reset(main);
			$.template_effect(() => $.set_text(text_5, `Clicked: ${$.get(clicked) ?? ''}`));
			$.append($$anchor, main);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}