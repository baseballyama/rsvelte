import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Accordion, { Panel, Header, Content } from '@smui-extra/accordion';
import Button from '@smui/button';
import Tooltip, { Wrapper } from '@smui/tooltip';
import { Label } from '@smui/common';
import Menu from '@smui/menu';
import List, { Item, Text } from '@smui/list';
import Dialog, { Title, Content as DialogContent, Actions } from '@smui/dialog';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div style="display: inline-block;"><!> <!></div> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<div style="display: flex; justify-content: space-between; align-items: center;">This panel has really cool content! <!></div> <!>`, 1);
var root_4 = $.from_html(`<div class="accordion-container"><!></div>`);

export default function _Complex($$anchor) {
	let menu;
	let dialogOpen = $.state(false);
	var div = root_4();
	var node = $.child(div);

	Accordion(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root_2();
			var node_1 = $.first_child(fragment);

			Panel(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_2 = $.first_child(fragment_1);

					Header(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Panel with Simple Content');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					Content(node_3, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('This panel has boring content.');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_1, 2);

			Panel(node_4, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_5 = $.first_child(fragment_2);

					Header(node_5, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Panel with Extravagent Content');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					Content(node_6, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_3();
							var div_1 = $.first_child(fragment_3);
							var node_7 = $.sibling($.child(div_1));

							Wrapper(node_7, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_1();
									var div_2 = $.first_child(fragment_4);
									var node_8 = $.child(div_2);

									Button(node_8, {
										onclick: () => menu.setOpen(true),
										children: ($$anchor, $$slotProps) => {
											Label($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('Really?');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									var node_9 = $.sibling(node_8, 2);

									$.bind_this(
										Menu(node_9, {
											children: ($$anchor, $$slotProps) => {
												List($$anchor, {
													children: ($$anchor, $$slotProps) => {
														Item($$anchor, {
															onSMUIAction: () => {
																$.set(dialogOpen, true);
															},

															children: ($$anchor, $$slotProps) => {
																Text($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_4 = $.text('Yes!');

																		$.append($$anchor, text_4);
																	},
																	$$slots: { default: true }
																});
															},
															$$slots: { default: true }
														});
													},
													$$slots: { default: true }
												});
											},
											$$slots: { default: true }
										}),
										($$value) => menu = $$value,
										() => menu
									);

									$.reset(div_2);

									var node_10 = $.sibling(div_2, 2);

									Tooltip(node_10, {
										yPos: 'below',
										children: ($$anchor, $$slotProps) => {
											Label($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text('This tooltip should extend outside the panel!');

													$.append($$anchor, text_5);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});

							$.reset(div_1);

							var node_11 = $.sibling(div_1, 2);

							Dialog(node_11, {
								'aria-labelledby': 'complex-accordion-dialog-title',
								'aria-describedby': 'complex-accordion-dialog-content',
								get open() {
									return $.get(dialogOpen);
								},

								set open($$value) {
									$.set(dialogOpen, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_10 = root_2();
									var node_12 = $.first_child(fragment_10);

									Title(node_12, {
										id: 'complex-accordion-dialog-title',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_6 = $.text('A Dialog!');

											$.append($$anchor, text_6);
										},
										$$slots: { default: true }
									});

									var node_13 = $.sibling(node_12, 2);

									DialogContent(node_13, {
										id: 'complex-accordion-dialog-content',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_7 = $.text('This dialog is even a child of the panel!');

											$.append($$anchor, text_7);
										},
										$$slots: { default: true }
									});

									var node_14 = $.sibling(node_13, 2);

									Actions(node_14, {
										children: ($$anchor, $$slotProps) => {
											Button($$anchor, {
												defaultAction: true,
												children: ($$anchor, $$slotProps) => {
													Label($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_8 = $.text('Wow!');

															$.append($$anchor, text_8);
														},
														$$slots: { default: true }
													});
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_10);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_15 = $.sibling(node_4, 2);

			Panel(node_15, {
				children: ($$anchor, $$slotProps) => {
					var fragment_13 = root();
					var node_16 = $.first_child(fragment_13);

					Header(node_16, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_9 = $.text('Panel with Simple Content');

							$.append($$anchor, text_9);
						},
						$$slots: { default: true }
					});

					var node_17 = $.sibling(node_16, 2);

					Content(node_17, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_10 = $.text('This panel has boring content.');

							$.append($$anchor, text_10);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_13);
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