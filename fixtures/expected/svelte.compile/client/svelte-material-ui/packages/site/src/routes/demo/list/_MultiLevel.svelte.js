import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import List, { Item, Text } from '@smui/list';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="svelte-1iez5rj"><!></div> <pre class="status svelte-1iez5rj"> </pre>`, 1);

export default function _MultiLevel($$anchor) {
	let clicked = $.state('nothing yet');
	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.child(div);

	List(node, {
		class: 'demo-list',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			Item(node_1, {
				onSMUIAction: () => $.set(clicked, 'Level 1 - 1'),
				children: ($$anchor, $$slotProps) => {
					Text($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Level 1 - 1');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Item(node_2, {
				onSMUIAction: () => $.set(clicked, 'Level 1 - 2'),
				children: ($$anchor, $$slotProps) => {
					Text($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Level 1 - 2');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Item(node_3, {
				onSMUIAction: () => $.set(clicked, 'Level 1 - 3'),
				children: ($$anchor, $$slotProps) => {
					Text($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Level 1 - 3');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Item(node_4, {
				wrapper: true,
				children: ($$anchor, $$slotProps) => {
					List($$anchor, {
						class: 'sub-list',
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root();
							var node_5 = $.first_child(fragment_6);

							Item(node_5, {
								onSMUIAction: () => $.set(clicked, 'Level 2.1 - 1'),
								children: ($$anchor, $$slotProps) => {
									Text($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('Level 2.1 - 1');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							var node_6 = $.sibling(node_5, 2);

							Item(node_6, {
								onSMUIAction: () => $.set(clicked, 'Level 2.1 - 2'),
								children: ($$anchor, $$slotProps) => {
									Text($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_4 = $.text('Level 2.1 - 2');

											$.append($$anchor, text_4);
										},
										$$slots: { default: true }
									});
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

			var node_7 = $.sibling(node_4, 2);

			Item(node_7, {
				onSMUIAction: () => $.set(clicked, 'Level 1 - 4'),
				children: ($$anchor, $$slotProps) => {
					Text($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Level 1 - 4');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_7, 2);

			Item(node_8, {
				wrapper: true,
				children: ($$anchor, $$slotProps) => {
					List($$anchor, {
						class: 'sub-list',
						children: ($$anchor, $$slotProps) => {
							var fragment_11 = root();
							var node_9 = $.first_child(fragment_11);

							Item(node_9, {
								onSMUIAction: () => $.set(clicked, 'Level 2.2 - 1'),
								children: ($$anchor, $$slotProps) => {
									Text($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_6 = $.text('Level 2.2 - 1');

											$.append($$anchor, text_6);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							var node_10 = $.sibling(node_9, 2);

							Item(node_10, {
								onSMUIAction: () => $.set(clicked, 'Level 2.2 - 2'),
								children: ($$anchor, $$slotProps) => {
									Text($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_7 = $.text('Level 2.2 - 2');

											$.append($$anchor, text_7);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_11);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var pre = $.sibling(div, 2);
	var text_8 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_8, `Clicked: ${$.get(clicked) ?? ''}`));
	$.append($$anchor, fragment);
}