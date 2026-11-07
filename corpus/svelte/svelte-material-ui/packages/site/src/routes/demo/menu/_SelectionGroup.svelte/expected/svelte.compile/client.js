import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Menu, { SelectionGroup, SelectionGroupIcon } from '@smui/menu';
import List, { Item, Separator, Text } from '@smui/list';
import Button, { Label } from '@smui/button';

var root = $.from_html(`<i class="material-icons">check</i>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<div style="min-width: 100px;"><!> <!></div> <pre class="status"> </pre> <pre class="status"> </pre> <pre class="status"> </pre>`, 1);

export default function _SelectionGroup($$anchor) {
	let menu;
	let clicked = $.state('nothing yet');
	let selected1 = $.state('Red');
	let selected2 = $.state('Small');
	var fragment = root_3();
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
			children: ($$anchor, $$slotProps) => {
				List($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root_2();
						var node_2 = $.first_child(fragment_3);

						SelectionGroup(node_2, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = $.comment();
								var node_3 = $.first_child(fragment_4);

								$.each(node_3, 16, () => ['Red', 'Green', 'Blue'], $.index, ($$anchor, item) => {
									{
										let $0 = $.derived(() => $.get(selected1) === item);

										Item($$anchor, {
											onSMUIAction: () => $.set(selected1, item, true),
											get selected() {
												return $.get($0);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root_1();
												var node_4 = $.first_child(fragment_6);

												SelectionGroupIcon(node_4, {
													children: ($$anchor, $$slotProps) => {
														var i = root();

														$.append($$anchor, i);
													},
													$$slots: { default: true }
												});

												var node_5 = $.sibling(node_4, 2);

												Text(node_5, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text();

														$.template_effect(() => $.set_text(text_1, item));
														$.append($$anchor, text_1);
													},
													$$slots: { default: true }
												});

												$.append($$anchor, fragment_6);
											},
											$$slots: { default: true }
										});
									}
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});

						var node_6 = $.sibling(node_2, 2);

						Separator(node_6, {});

						var node_7 = $.sibling(node_6, 2);

						SelectionGroup(node_7, {
							children: ($$anchor, $$slotProps) => {
								var fragment_8 = $.comment();
								var node_8 = $.first_child(fragment_8);

								$.each(node_8, 16, () => ['Small', 'Medium', 'Large'], $.index, ($$anchor, item) => {
									{
										let $0 = $.derived(() => $.get(selected2) === item);

										Item($$anchor, {
											onSMUIAction: () => $.set(selected2, item, true),
											get selected() {
												return $.get($0);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_10 = root_1();
												var node_9 = $.first_child(fragment_10);

												SelectionGroupIcon(node_9, {
													children: ($$anchor, $$slotProps) => {
														var i_1 = root();

														$.append($$anchor, i_1);
													},
													$$slots: { default: true }
												});

												var node_10 = $.sibling(node_9, 2);

												Text(node_10, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text();

														$.template_effect(() => $.set_text(text_2, item));
														$.append($$anchor, text_2);
													},
													$$slots: { default: true }
												});

												$.append($$anchor, fragment_10);
											},
											$$slots: { default: true }
										});
									}
								});

								$.append($$anchor, fragment_8);
							},
							$$slots: { default: true }
						});

						var node_11 = $.sibling(node_7, 2);

						Separator(node_11, {});

						var node_12 = $.sibling(node_11, 2);

						Item(node_12, {
							onSMUIAction: () => $.set(clicked, 'Save for Later'),
							children: ($$anchor, $$slotProps) => {
								Text($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('Save for Later');

										$.append($$anchor, text_3);
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

	var pre = $.sibling(div, 2);
	var text_4 = $.only_child(pre);
	var pre_1 = $.sibling(pre, 2);
	var text_5 = $.only_child(pre_1);
	var pre_2 = $.sibling(pre_1, 2);
	var text_6 = $.only_child(pre_2);

	$.template_effect(() => {
		$.set_text(text_4, `Selection 1: ${$.get(selected1) ?? ''}`);
		$.set_text(text_5, `Selection 2: ${$.get(selected2) ?? ''}`);
		$.set_text(text_6, `Clicked: ${$.get(clicked) ?? ''}`);
	});

	$.append($$anchor, fragment);
}