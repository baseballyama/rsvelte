import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button, { Group, GroupItem, Label, Icon } from '@smui/button';
import Menu from '@smui/menu';
import List, { Item, Separator, Text } from '@smui/list';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <div><!> <!></div>`, 1);
var root_2 = $.from_html(`<!> <!> <pre class="status"> </pre>`, 1);

export default function _SplitButtons($$anchor) {
	let clicked = $.state(0);
	let menu;
	let menu2;
	var fragment = root_2();
	var node = $.first_child(fragment);

	Group(node, {
		variant: 'raised',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			Button(node_1, {
				onclick: () => $.update(clicked),
				variant: 'raised',
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Do the thing');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var div = $.sibling(node_1, 2);
			var node_2 = $.child(div);

			Button(node_2, {
				onclick: () => menu.setOpen(true),
				variant: 'raised',
				style: 'padding: 0; min-width: 36px;',
				children: ($$anchor, $$slotProps) => {
					Icon($$anchor, {
						class: 'material-icons',
						style: 'margin: 0;',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('arrow_drop_down');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			$.bind_this(
				Menu(node_3, {
					anchorCorner: 'TOP_LEFT',
					children: ($$anchor, $$slotProps) => {
						List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_5 = root();
								var node_4 = $.first_child(fragment_5);

								Item(node_4, {
									onSMUIAction: () => $.update(clicked),
									children: ($$anchor, $$slotProps) => {
										Text($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Thing 1');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								var node_5 = $.sibling(node_4, 2);

								Item(node_5, {
									onSMUIAction: () => $.update(clicked),
									children: ($$anchor, $$slotProps) => {
										Text($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('Thing 2');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								var node_6 = $.sibling(node_5, 2);

								Separator(node_6, {});

								var node_7 = $.sibling(node_6, 2);

								Item(node_7, {
									onSMUIAction: () => $.update(clicked),
									children: ($$anchor, $$slotProps) => {
										Text($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('Thing 3');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_5);
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
			$.action(div, ($$node) => GroupItem?.($$node));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node, 2);

	Group(node_8, {
		variant: 'outlined',
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = root_1();
			var node_9 = $.first_child(fragment_9);

			Button(node_9, {
				onclick: () => $.update(clicked),
				variant: 'outlined',
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Do the thing');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var div_1 = $.sibling(node_9, 2);
			var node_10 = $.child(div_1);

			Button(node_10, {
				onclick: () => menu2.setOpen(true),
				variant: 'outlined',
				style: 'padding: 0; min-width: 36px;',
				children: ($$anchor, $$slotProps) => {
					Icon($$anchor, {
						class: 'material-icons',
						style: 'margin: 0;',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('arrow_drop_down');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_10, 2);

			$.bind_this(
				Menu(node_11, {
					anchorCorner: 'TOP_LEFT',
					children: ($$anchor, $$slotProps) => {
						List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_13 = root();
								var node_12 = $.first_child(fragment_13);

								Item(node_12, {
									onSMUIAction: () => $.update(clicked),
									children: ($$anchor, $$slotProps) => {
										Text($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_7 = $.text('Thing 1');

												$.append($$anchor, text_7);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								var node_13 = $.sibling(node_12, 2);

								Item(node_13, {
									onSMUIAction: () => $.update(clicked),
									children: ($$anchor, $$slotProps) => {
										Text($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_8 = $.text('Thing 2');

												$.append($$anchor, text_8);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								var node_14 = $.sibling(node_13, 2);

								Separator(node_14, {});

								var node_15 = $.sibling(node_14, 2);

								Item(node_15, {
									onSMUIAction: () => $.update(clicked),
									children: ($$anchor, $$slotProps) => {
										Text($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_9 = $.text('Thing 3');

												$.append($$anchor, text_9);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_13);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				}),
				($$value) => menu2 = $$value,
				() => menu2
			);

			$.reset(div_1);
			$.action(div_1, ($$node) => GroupItem?.($$node));
			$.append($$anchor, fragment_9);
		},
		$$slots: { default: true }
	});

	var pre = $.sibling(node_8, 2);
	var text_10 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_10, `Clicked: ${$.get(clicked) ?? ''}`));
	$.append($$anchor, fragment);
}