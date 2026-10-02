import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Confirm, ViewToggle } from '$lib/components';
import ColumnSelector from '$lib/components/columnSelector.svelte';
import { IconViewBoards } from '@appwrite.io/pink-icons-svelte';
import { Button, Icon, Layout, Typography } from '@appwrite.io/pink-svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function DisplaySettingsModal($$anchor, $$props) {
	$.push($$props, true);

	const $columns = () => $.store_get($$props.columns, '$columns', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let show = $.prop($$props, 'show', 15, false),
		hideView = $.prop($$props, 'hideView', 3, false),
		view = $.prop($$props, 'view', 15),
		hideColumns = $.prop($$props, 'hideColumns', 3, false),
		isCustomTable = $.prop($$props, 'isCustomTable', 3, false);

	Confirm($$anchor, {
		title: 'Adjustments',
		canDelete: false,
		get open() {
			return show();
		},

		set open($$value) {
			show($$value);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						{
							var consequent = ($$anchor) => {
								var fragment_3 = $.comment();
								var node_2 = $.first_child(fragment_3);

								$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
									Layout_Stack_1($$anchor, {
										gap: 'xs',
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root();
											var node_3 = $.first_child(fragment_4);

											$.component(node_3, () => Typography.Text, ($$anchor, Typography_Text) => {
												Typography_Text($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text = $.text('Layout');

														$.append($$anchor, text);
													},
													$$slots: { default: true }
												});
											});

											var node_4 = $.sibling(node_3, 2);

											ViewToggle(node_4, {
												get view() {
													return view();
												},

												set view($$value) {
													view($$value);
												}
											});

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_3);
							};

							$.if(node_1, ($$render) => {
								if (!hideView()) $$render(consequent);
							});
						}

						var node_5 = $.sibling(node_1, 2);

						{
							var consequent_1 = ($$anchor) => {
								var fragment_5 = $.comment();
								var node_6 = $.first_child(fragment_5);

								$.component(node_6, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
									Layout_Stack_2($$anchor, {
										gap: 'xs',
										children: ($$anchor, $$slotProps) => {
											var fragment_6 = root();
											var node_7 = $.first_child(fragment_6);

											$.component(node_7, () => Typography.Text, ($$anchor, Typography_Text_1) => {
												Typography_Text_1($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text('Columns');

														$.append($$anchor, text_1);
													},
													$$slots: { default: true }
												});
											});

											var node_8 = $.sibling(node_7, 2);

											{
												const children = ($$anchor, toggle = $.noop, selectedColumnsNumber = $.noop) => {
													var fragment_7 = $.comment();
													var node_9 = $.first_child(fragment_7);

													{
														let $0 = $.derived(() => selectedColumnsNumber().toString());

														$.component(node_9, () => Button.Button, ($$anchor, Button_Button) => {
															Button_Button($$anchor, {
																size: 's',
																variant: 'secondary',
																get badge() {
																	return $.get($0);
																},

																$$events: {
																	click: function (...$$args) {
																		toggle()?.apply(this, $$args);
																	}
																},

																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_2 = $.text('Columns');

																	$.append($$anchor, text_2);
																},

																$$slots: {
																	default: true,
																	start: ($$anchor, $$slotProps) => {
																		Icon($$anchor, {
																			slot: 'start',
																			get icon() {
																				return IconViewBoards;
																			}
																		});
																	}
																}
															});
														});
													}

													$.append($$anchor, fragment_7);
												};

												ColumnSelector(node_8, {
													ui: 'new',
													get columns() {
														return $$props.columns;
													},

													get isCustomTable() {
														return isCustomTable();
													},
													children,
													$$slots: { default: true }
												});
											}

											$.append($$anchor, fragment_6);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_5);
							};

							$.if(node_5, ($$render) => {
								if (!hideColumns() && $columns()?.length) $$render(consequent_1);
							});
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
	$$cleanup();
}