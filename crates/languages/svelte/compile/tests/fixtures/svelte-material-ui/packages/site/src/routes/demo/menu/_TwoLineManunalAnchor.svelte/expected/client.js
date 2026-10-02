import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Menu from '@smui/menu';
import { Anchor } from '@smui/menu-surface';
import List, { Item, Separator, Text, PrimaryText, SecondaryText } from '@smui/list';
import Button, { Label } from '@smui/button';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div><!> <!></div> <pre class="status"> </pre>`, 1);

export default function _TwoLineManunalAnchor($$anchor, $$props) {
	$.push($$props, true);

	let menu;
	let anchor = $.state(void 0);
	let anchorClasses = $.proxy({});
	let clicked = $.state('nothing yet');
	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Button(node, {
		onclick: () => menu.setOpen(true),
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Open Menu');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	$.bind_this(
		Menu(node_1, {
			anchor: false,
			get anchorElement() {
				return $.get(anchor);
			},
			anchorCorner: 'BOTTOM_LEFT',
			children: ($$anchor, $$slotProps) => {
				List($$anchor, {
					twoLine: true,
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root_1();
						var node_2 = $.first_child(fragment_3);

						Item(node_2, {
							onSMUIAction: () => $.set(clicked, 'Cut'),
							children: ($$anchor, $$slotProps) => {
								Text($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root();
										var node_3 = $.first_child(fragment_5);

										PrimaryText(node_3, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Cut');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});

										var node_4 = $.sibling(node_3, 2);

										SecondaryText(node_4, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Copy to clipboard and remove.');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						var node_5 = $.sibling(node_2, 2);

						Item(node_5, {
							onSMUIAction: () => $.set(clicked, 'Copy'),
							children: ($$anchor, $$slotProps) => {
								Text($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_7 = root();
										var node_6 = $.first_child(fragment_7);

										PrimaryText(node_6, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('Copy');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});

										var node_7 = $.sibling(node_6, 2);

										SecondaryText(node_7, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('Copy to clipboard.');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_7);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						var node_8 = $.sibling(node_5, 2);

						Item(node_8, {
							onSMUIAction: () => $.set(clicked, 'Paste'),
							children: ($$anchor, $$slotProps) => {
								Text($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_9 = root();
										var node_9 = $.first_child(fragment_9);

										PrimaryText(node_9, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_5 = $.text('Paste');

												$.append($$anchor, text_5);
											},
											$$slots: { default: true }
										});

										var node_10 = $.sibling(node_9, 2);

										SecondaryText(node_10, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_6 = $.text('Paste from clipboard.');

												$.append($$anchor, text_6);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_9);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						var node_11 = $.sibling(node_8, 2);

						Separator(node_11, {});

						var node_12 = $.sibling(node_11, 2);

						Item(node_12, {
							onSMUIAction: () => $.set(clicked, 'Delete'),
							children: ($$anchor, $$slotProps) => {
								Text($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_11 = root();
										var node_13 = $.first_child(fragment_11);

										PrimaryText(node_13, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_7 = $.text('Delete');

												$.append($$anchor, text_7);
											},
											$$slots: { default: true }
										});

										var node_14 = $.sibling(node_13, 2);

										SecondaryText(node_14, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_8 = $.text('Remove item.');

												$.append($$anchor, text_8);
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

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		}),
		($$value) => menu = $$value,
		() => menu
	);

	$.reset(div);

	$.action(div, ($$node, $$action_arg) => Anchor?.($$node, $$action_arg), () => ({
		addClass: (className) => {
			if (!anchorClasses[className]) {
				anchorClasses[className] = true;
			}
		},

		removeClass: (className) => {
			if (anchorClasses[className]) {
				delete anchorClasses[className];
			}
		}
	}));

	$.bind_this(div, ($$value) => $.set(anchor, $$value), () => $.get(anchor));

	var pre = $.sibling(div, 2);
	var text_9 = $.only_child(pre);

	$.template_effect(
		($0) => {
			$.set_class(div, 1, $0);
			$.set_text(text_9, `Clicked: ${$.get(clicked) ?? ''}`);
		},
		[() => $.clsx(Object.keys(anchorClasses).join(' '))]
	);

	$.append($$anchor, fragment);
	$.pop();
}