import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import { Table } from "$lib/index.js";
import { tableDefault, tableStriped, tableInteractive, tableFull } from "$lib/../docs/data/table.js";
import Pagination from "$lib/pagination/pagination.svelte";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

const table = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
};

const demoAndCode = ($$anchor, demo = $.noop, code = $.noop) => {
	var div = root_1();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	$.snippet(node, demo);
	$.reset(div_2);
	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

	CollapseCode(node_1, {
		get code() {
			return code();
		}
	});

	$.reset(div);
	$.append($$anchor, div);
};

const defaultTable = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_5();
			var node_2 = $.first_child(fragment_3);

			LinkH2(node_2, {
				href: '/table#basic-table',
				'aria-label': 'basic-table',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('basic table');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var div_3 = $.sibling(node_2, 2);

			{
				const demo = ($$anchor) => {
					var div_4 = root_4();
					var node_3 = $.child(div_4);

					$.component(node_3, () => Table.Root, ($$anchor, Table_Root) => {
						Table_Root($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root_3();
								var node_4 = $.first_child(fragment_4);

								$.component(node_4, () => Table.Header, ($$anchor, Table_Header) => {
									Table_Header($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = $.comment();
											var node_5 = $.first_child(fragment_5);

											$.component(node_5, () => Table.Row, ($$anchor, Table_Row) => {
												Table_Row($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_6 = root_2();
														var node_6 = $.first_child(fragment_6);

														$.component(node_6, () => Table.Head, ($$anchor, Table_Head) => {
															Table_Head($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_1 = $.text('Col 1');

																	$.append($$anchor, text_1);
																},
																$$slots: { default: true }
															});
														});

														var node_7 = $.sibling(node_6, 2);

														$.component(node_7, () => Table.Head, ($$anchor, Table_Head_1) => {
															Table_Head_1($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_2 = $.text('Col 2');

																	$.append($$anchor, text_2);
																},
																$$slots: { default: true }
															});
														});

														var node_8 = $.sibling(node_7, 2);

														$.component(node_8, () => Table.Head, ($$anchor, Table_Head_2) => {
															Table_Head_2($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_3 = $.text('Col 3');

																	$.append($$anchor, text_3);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_6);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_5);
										},
										$$slots: { default: true }
									});
								});

								var node_9 = $.sibling(node_4, 2);

								$.component(node_9, () => Table.Body, ($$anchor, Table_Body) => {
									Table_Body($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_7 = root_2();
											var node_10 = $.first_child(fragment_7);

											$.component(node_10, () => Table.Row, ($$anchor, Table_Row_1) => {
												Table_Row_1($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_8 = root_2();
														var node_11 = $.first_child(fragment_8);

														$.component(node_11, () => Table.Cell, ($$anchor, Table_Cell) => {
															Table_Cell($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_4 = $.text('Value 1.1');

																	$.append($$anchor, text_4);
																},
																$$slots: { default: true }
															});
														});

														var node_12 = $.sibling(node_11, 2);

														$.component(node_12, () => Table.Cell, ($$anchor, Table_Cell_1) => {
															Table_Cell_1($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_5 = $.text('Value 1.2');

																	$.append($$anchor, text_5);
																},
																$$slots: { default: true }
															});
														});

														var node_13 = $.sibling(node_12, 2);

														$.component(node_13, () => Table.Cell, ($$anchor, Table_Cell_2) => {
															Table_Cell_2($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_6 = $.text('Value 1.3');

																	$.append($$anchor, text_6);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_8);
													},
													$$slots: { default: true }
												});
											});

											var node_14 = $.sibling(node_10, 2);

											$.component(node_14, () => Table.Row, ($$anchor, Table_Row_2) => {
												Table_Row_2($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_9 = root_2();
														var node_15 = $.first_child(fragment_9);

														$.component(node_15, () => Table.Cell, ($$anchor, Table_Cell_3) => {
															Table_Cell_3($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_7 = $.text('Value 2.1');

																	$.append($$anchor, text_7);
																},
																$$slots: { default: true }
															});
														});

														var node_16 = $.sibling(node_15, 2);

														$.component(node_16, () => Table.Cell, ($$anchor, Table_Cell_4) => {
															Table_Cell_4($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_8 = $.text('Value 2.2');

																	$.append($$anchor, text_8);
																},
																$$slots: { default: true }
															});
														});

														var node_17 = $.sibling(node_16, 2);

														$.component(node_17, () => Table.Cell, ($$anchor, Table_Cell_5) => {
															Table_Cell_5($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_9 = $.text('Value 2.3');

																	$.append($$anchor, text_9);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_9);
													},
													$$slots: { default: true }
												});
											});

											var node_18 = $.sibling(node_14, 2);

											$.component(node_18, () => Table.Row, ($$anchor, Table_Row_3) => {
												Table_Row_3($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_10 = root_2();
														var node_19 = $.first_child(fragment_10);

														$.component(node_19, () => Table.Cell, ($$anchor, Table_Cell_6) => {
															Table_Cell_6($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_10 = $.text('Value 3.1');

																	$.append($$anchor, text_10);
																},
																$$slots: { default: true }
															});
														});

														var node_20 = $.sibling(node_19, 2);

														$.component(node_20, () => Table.Cell, ($$anchor, Table_Cell_7) => {
															Table_Cell_7($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_11 = $.text('Value 3.2');

																	$.append($$anchor, text_11);
																},
																$$slots: { default: true }
															});
														});

														var node_21 = $.sibling(node_20, 2);

														$.component(node_21, () => Table.Cell, ($$anchor, Table_Cell_8) => {
															Table_Cell_8($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_12 = $.text('Value 3.3');

																	$.append($$anchor, text_12);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_10);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_7);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					});

					$.reset(div_4);
					$.append($$anchor, div_4);
				};

				var node_22 = $.child(div_3);

				demoAndCode(node_22, () => demo, () => tableDefault);
				$.reset(div_3);
			}

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});
};

const striped = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_12 = root_5();
			var node_23 = $.first_child(fragment_12);

			LinkH2(node_23, {
				href: '/table#striped-table',
				'aria-label': 'striped-table',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_13 = $.text('striped table');

					$.append($$anchor, text_13);
				},
				$$slots: { default: true }
			});

			var div_5 = $.sibling(node_23, 2);

			{
				const demo = ($$anchor) => {
					var div_6 = root_4();
					var node_24 = $.child(div_6);

					$.component(node_24, () => Table.Root, ($$anchor, Table_Root_1) => {
						Table_Root_1($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_13 = root_3();
								var node_25 = $.first_child(fragment_13);

								$.component(node_25, () => Table.Header, ($$anchor, Table_Header_1) => {
									Table_Header_1($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_14 = $.comment();
											var node_26 = $.first_child(fragment_14);

											$.component(node_26, () => Table.Row, ($$anchor, Table_Row_4) => {
												Table_Row_4($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_15 = root_2();
														var node_27 = $.first_child(fragment_15);

														$.component(node_27, () => Table.Head, ($$anchor, Table_Head_3) => {
															Table_Head_3($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_14 = $.text('Col 1');

																	$.append($$anchor, text_14);
																},
																$$slots: { default: true }
															});
														});

														var node_28 = $.sibling(node_27, 2);

														$.component(node_28, () => Table.Head, ($$anchor, Table_Head_4) => {
															Table_Head_4($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_15 = $.text('Col 2');

																	$.append($$anchor, text_15);
																},
																$$slots: { default: true }
															});
														});

														var node_29 = $.sibling(node_28, 2);

														$.component(node_29, () => Table.Head, ($$anchor, Table_Head_5) => {
															Table_Head_5($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_16 = $.text('Col 3');

																	$.append($$anchor, text_16);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_15);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_14);
										},
										$$slots: { default: true }
									});
								});

								var node_30 = $.sibling(node_25, 2);

								$.component(node_30, () => Table.Body, ($$anchor, Table_Body_1) => {
									Table_Body_1($$anchor, {
										striped: true,
										children: ($$anchor, $$slotProps) => {
											var fragment_16 = root_2();
											var node_31 = $.first_child(fragment_16);

											$.component(node_31, () => Table.Row, ($$anchor, Table_Row_5) => {
												Table_Row_5($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_17 = root_2();
														var node_32 = $.first_child(fragment_17);

														$.component(node_32, () => Table.Cell, ($$anchor, Table_Cell_9) => {
															Table_Cell_9($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_17 = $.text('Value 1.1');

																	$.append($$anchor, text_17);
																},
																$$slots: { default: true }
															});
														});

														var node_33 = $.sibling(node_32, 2);

														$.component(node_33, () => Table.Cell, ($$anchor, Table_Cell_10) => {
															Table_Cell_10($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_18 = $.text('Value 1.2');

																	$.append($$anchor, text_18);
																},
																$$slots: { default: true }
															});
														});

														var node_34 = $.sibling(node_33, 2);

														$.component(node_34, () => Table.Cell, ($$anchor, Table_Cell_11) => {
															Table_Cell_11($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_19 = $.text('Value 1.3');

																	$.append($$anchor, text_19);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_17);
													},
													$$slots: { default: true }
												});
											});

											var node_35 = $.sibling(node_31, 2);

											$.component(node_35, () => Table.Row, ($$anchor, Table_Row_6) => {
												Table_Row_6($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_18 = root_2();
														var node_36 = $.first_child(fragment_18);

														$.component(node_36, () => Table.Cell, ($$anchor, Table_Cell_12) => {
															Table_Cell_12($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_20 = $.text('Value 2.1');

																	$.append($$anchor, text_20);
																},
																$$slots: { default: true }
															});
														});

														var node_37 = $.sibling(node_36, 2);

														$.component(node_37, () => Table.Cell, ($$anchor, Table_Cell_13) => {
															Table_Cell_13($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_21 = $.text('Value 2.2');

																	$.append($$anchor, text_21);
																},
																$$slots: { default: true }
															});
														});

														var node_38 = $.sibling(node_37, 2);

														$.component(node_38, () => Table.Cell, ($$anchor, Table_Cell_14) => {
															Table_Cell_14($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_22 = $.text('Value 2.3');

																	$.append($$anchor, text_22);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_18);
													},
													$$slots: { default: true }
												});
											});

											var node_39 = $.sibling(node_35, 2);

											$.component(node_39, () => Table.Row, ($$anchor, Table_Row_7) => {
												Table_Row_7($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_19 = root_2();
														var node_40 = $.first_child(fragment_19);

														$.component(node_40, () => Table.Cell, ($$anchor, Table_Cell_15) => {
															Table_Cell_15($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_23 = $.text('Value 3.1');

																	$.append($$anchor, text_23);
																},
																$$slots: { default: true }
															});
														});

														var node_41 = $.sibling(node_40, 2);

														$.component(node_41, () => Table.Cell, ($$anchor, Table_Cell_16) => {
															Table_Cell_16($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_24 = $.text('Value 3.2');

																	$.append($$anchor, text_24);
																},
																$$slots: { default: true }
															});
														});

														var node_42 = $.sibling(node_41, 2);

														$.component(node_42, () => Table.Cell, ($$anchor, Table_Cell_17) => {
															Table_Cell_17($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_25 = $.text('Value 3.3');

																	$.append($$anchor, text_25);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_19);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_16);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_13);
							},
							$$slots: { default: true }
						});
					});

					$.reset(div_6);
					$.append($$anchor, div_6);
				};

				var node_43 = $.child(div_5);

				demoAndCode(node_43, () => demo, () => tableStriped);
				$.reset(div_5);
			}

			$.append($$anchor, fragment_12);
		},
		$$slots: { default: true }
	});
};

const interactive = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_21 = root_5();
			var node_44 = $.first_child(fragment_21);

			LinkH2(node_44, {
				href: '/table#interactive-table',
				'aria-label': 'interactive-table',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_26 = $.text('interactive table');

					$.append($$anchor, text_26);
				},
				$$slots: { default: true }
			});

			var div_7 = $.sibling(node_44, 2);

			{
				const demo = ($$anchor) => {
					var div_8 = root_4();
					var node_45 = $.child(div_8);

					$.component(node_45, () => Table.Root, ($$anchor, Table_Root_2) => {
						Table_Root_2($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_22 = root_3();
								var node_46 = $.first_child(fragment_22);

								$.component(node_46, () => Table.Header, ($$anchor, Table_Header_2) => {
									Table_Header_2($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_23 = $.comment();
											var node_47 = $.first_child(fragment_23);

											$.component(node_47, () => Table.Row, ($$anchor, Table_Row_8) => {
												Table_Row_8($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_24 = root_2();
														var node_48 = $.first_child(fragment_24);

														$.component(node_48, () => Table.Head, ($$anchor, Table_Head_6) => {
															Table_Head_6($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_27 = $.text('Col 1');

																	$.append($$anchor, text_27);
																},
																$$slots: { default: true }
															});
														});

														var node_49 = $.sibling(node_48, 2);

														$.component(node_49, () => Table.Head, ($$anchor, Table_Head_7) => {
															Table_Head_7($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_28 = $.text('Col 2');

																	$.append($$anchor, text_28);
																},
																$$slots: { default: true }
															});
														});

														var node_50 = $.sibling(node_49, 2);

														$.component(node_50, () => Table.Head, ($$anchor, Table_Head_8) => {
															Table_Head_8($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_29 = $.text('Col 3');

																	$.append($$anchor, text_29);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_24);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_23);
										},
										$$slots: { default: true }
									});
								});

								var node_51 = $.sibling(node_46, 2);

								$.component(node_51, () => Table.Body, ($$anchor, Table_Body_2) => {
									Table_Body_2($$anchor, {
										interactive: true,
										children: ($$anchor, $$slotProps) => {
											var fragment_25 = root_2();
											var node_52 = $.first_child(fragment_25);

											$.component(node_52, () => Table.Row, ($$anchor, Table_Row_9) => {
												Table_Row_9($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_26 = root_2();
														var node_53 = $.first_child(fragment_26);

														$.component(node_53, () => Table.Cell, ($$anchor, Table_Cell_18) => {
															Table_Cell_18($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_30 = $.text('Value 1.1');

																	$.append($$anchor, text_30);
																},
																$$slots: { default: true }
															});
														});

														var node_54 = $.sibling(node_53, 2);

														$.component(node_54, () => Table.Cell, ($$anchor, Table_Cell_19) => {
															Table_Cell_19($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_31 = $.text('Value 1.2');

																	$.append($$anchor, text_31);
																},
																$$slots: { default: true }
															});
														});

														var node_55 = $.sibling(node_54, 2);

														$.component(node_55, () => Table.Cell, ($$anchor, Table_Cell_20) => {
															Table_Cell_20($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_32 = $.text('Value 1.3');

																	$.append($$anchor, text_32);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_26);
													},
													$$slots: { default: true }
												});
											});

											var node_56 = $.sibling(node_52, 2);

											$.component(node_56, () => Table.Row, ($$anchor, Table_Row_10) => {
												Table_Row_10($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_27 = root_2();
														var node_57 = $.first_child(fragment_27);

														$.component(node_57, () => Table.Cell, ($$anchor, Table_Cell_21) => {
															Table_Cell_21($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_33 = $.text('Value 2.1');

																	$.append($$anchor, text_33);
																},
																$$slots: { default: true }
															});
														});

														var node_58 = $.sibling(node_57, 2);

														$.component(node_58, () => Table.Cell, ($$anchor, Table_Cell_22) => {
															Table_Cell_22($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_34 = $.text('Value 2.2');

																	$.append($$anchor, text_34);
																},
																$$slots: { default: true }
															});
														});

														var node_59 = $.sibling(node_58, 2);

														$.component(node_59, () => Table.Cell, ($$anchor, Table_Cell_23) => {
															Table_Cell_23($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_35 = $.text('Value 2.3');

																	$.append($$anchor, text_35);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_27);
													},
													$$slots: { default: true }
												});
											});

											var node_60 = $.sibling(node_56, 2);

											$.component(node_60, () => Table.Row, ($$anchor, Table_Row_11) => {
												Table_Row_11($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_28 = root_2();
														var node_61 = $.first_child(fragment_28);

														$.component(node_61, () => Table.Cell, ($$anchor, Table_Cell_24) => {
															Table_Cell_24($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_36 = $.text('Value 3.1');

																	$.append($$anchor, text_36);
																},
																$$slots: { default: true }
															});
														});

														var node_62 = $.sibling(node_61, 2);

														$.component(node_62, () => Table.Cell, ($$anchor, Table_Cell_25) => {
															Table_Cell_25($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_37 = $.text('Value 3.2');

																	$.append($$anchor, text_37);
																},
																$$slots: { default: true }
															});
														});

														var node_63 = $.sibling(node_62, 2);

														$.component(node_63, () => Table.Cell, ($$anchor, Table_Cell_26) => {
															Table_Cell_26($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_38 = $.text('Value 3.3');

																	$.append($$anchor, text_38);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_28);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_25);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_22);
							},
							$$slots: { default: true }
						});
					});

					$.reset(div_8);
					$.append($$anchor, div_8);
				};

				var node_64 = $.child(div_7);

				demoAndCode(node_64, () => demo, () => tableInteractive);
				$.reset(div_7);
			}

			$.append($$anchor, fragment_21);
		},
		$$slots: { default: true }
	});
};

const prevAndNext = ($$anchor) => {
	Row($$anchor, {
		bottomLine: false,
		children: ($$anchor, $$slotProps) => {
			Pagination($$anchor, {
				previous: { title: "switch", href: "/switch" },
				next: { title: "tabs", href: "/tabs" }
			});
		},
		$$slots: { default: true }
	});
};

const aside = ($$anchor) => {
	Aside($$anchor, {
		get asideDataList() {
			return asideData;
		}
	});
};

var root = $.from_html(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-12 lg:tracking-[-2.4px]">table</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-7.5 lg:tracking-[-0.33px]">A semantic HTML table component</p>`, 1);
var root_1 = $.from_html(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 overflow-hidden rounded-xl border"><div class="w-full overflow-x-auto p-4 lg:p-6"><div class="flex w-full flex-wrap gap-4"><!></div></div> <!></div>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<div class="w-full"><!></div>`);
var root_5 = $.from_html(`<!> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_6 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_7 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const full = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_30 = root_5();
				var node_65 = $.first_child(fragment_30);

				LinkH2(node_65, {
					href: '/table#full-featured-table',
					'aria-label': 'full-featured-table',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_39 = $.text('full featured table');

						$.append($$anchor, text_39);
					},
					$$slots: { default: true }
				});

				var div_9 = $.sibling(node_65, 2);

				{
					const demo = ($$anchor) => {
						var div_10 = root_4();
						var node_66 = $.child(div_10);

						$.component(node_66, () => Table.Root, ($$anchor, Table_Root_3) => {
							Table_Root_3($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_31 = root_6();
									var node_67 = $.first_child(fragment_31);

									$.component(node_67, () => Table.Colgroup, ($$anchor, Table_Colgroup) => {
										Table_Colgroup($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_32 = root_6();
												var node_68 = $.first_child(fragment_32);

												$.component(node_68, () => Table.Col, ($$anchor, Table_Col) => {
													Table_Col($$anchor, { class: 'w-[44%]' });
												});

												var node_69 = $.sibling(node_68, 2);

												$.component(node_69, () => Table.Col, ($$anchor, Table_Col_1) => {
													Table_Col_1($$anchor, { class: 'w-[22%]' });
												});

												var node_70 = $.sibling(node_69, 2);

												$.component(node_70, () => Table.Col, ($$anchor, Table_Col_2) => {
													Table_Col_2($$anchor, { class: 'w-[22%]' });
												});

												var node_71 = $.sibling(node_70, 2);

												$.component(node_71, () => Table.Col, ($$anchor, Table_Col_3) => {
													Table_Col_3($$anchor, { class: 'w-[11%]' });
												});

												$.append($$anchor, fragment_32);
											},
											$$slots: { default: true }
										});
									});

									var node_72 = $.sibling(node_67, 2);

									$.component(node_72, () => Table.Header, ($$anchor, Table_Header_3) => {
										Table_Header_3($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_33 = $.comment();
												var node_73 = $.first_child(fragment_33);

												$.component(node_73, () => Table.Row, ($$anchor, Table_Row_12) => {
													Table_Row_12($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_34 = root_6();
															var node_74 = $.first_child(fragment_34);

															$.component(node_74, () => Table.Head, ($$anchor, Table_Head_9) => {
																Table_Head_9($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_40 = $.text('Product');

																		$.append($$anchor, text_40);
																	},
																	$$slots: { default: true }
																});
															});

															var node_75 = $.sibling(node_74, 2);

															$.component(node_75, () => Table.Head, ($$anchor, Table_Head_10) => {
																Table_Head_10($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_41 = $.text('Usage');

																		$.append($$anchor, text_41);
																	},
																	$$slots: { default: true }
																});
															});

															var node_76 = $.sibling(node_75, 2);

															$.component(node_76, () => Table.Head, ($$anchor, Table_Head_11) => {
																Table_Head_11($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_42 = $.text('Price');

																		$.append($$anchor, text_42);
																	},
																	$$slots: { default: true }
																});
															});

															var node_77 = $.sibling(node_76, 2);

															$.component(node_77, () => Table.Head, ($$anchor, Table_Head_12) => {
																Table_Head_12($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_43 = $.text('Charge');

																		$.append($$anchor, text_43);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_34);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_33);
											},
											$$slots: { default: true }
										});
									});

									var node_78 = $.sibling(node_72, 2);

									$.component(node_78, () => Table.Body, ($$anchor, Table_Body_3) => {
										Table_Body_3($$anchor, {
											interactive: true,
											striped: true,
											children: ($$anchor, $$slotProps) => {
												var fragment_35 = $.comment();
												var node_79 = $.first_child(fragment_35);

												$.each(node_79, 17, () => items, $.index, ($$anchor, item) => {
													var fragment_36 = $.comment();
													var node_80 = $.first_child(fragment_36);

													$.component(node_80, () => Table.Row, ($$anchor, Table_Row_13) => {
														Table_Row_13($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_37 = root_6();
																var node_81 = $.first_child(fragment_37);

																$.component(node_81, () => Table.Cell, ($$anchor, Table_Cell_27) => {
																	Table_Cell_27($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_44 = $.text();

																			$.template_effect(() => $.set_text(text_44, $.get(item).product));
																			$.append($$anchor, text_44);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_82 = $.sibling(node_81, 2);

																$.component(node_82, () => Table.Cell, ($$anchor, Table_Cell_28) => {
																	Table_Cell_28($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_45 = $.text();

																			$.template_effect(() => $.set_text(text_45, $.get(item).usage));
																			$.append($$anchor, text_45);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_83 = $.sibling(node_82, 2);

																$.component(node_83, () => Table.Cell, ($$anchor, Table_Cell_29) => {
																	Table_Cell_29($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_46 = $.text();

																			$.template_effect(() => $.set_text(text_46, $.get(item).price));
																			$.append($$anchor, text_46);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_84 = $.sibling(node_83, 2);

																$.component(node_84, () => Table.Cell, ($$anchor, Table_Cell_30) => {
																	Table_Cell_30($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_47 = $.text();

																			$.template_effect(($0) => $.set_text(text_47, $0), [() => formatCurrency($.get(item).charge)]);
																			$.append($$anchor, text_47);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_37);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_36);
												});

												$.append($$anchor, fragment_35);
											},
											$$slots: { default: true }
										});
									});

									var node_85 = $.sibling(node_78, 2);

									$.component(node_85, () => Table.Footer, ($$anchor, Table_Footer) => {
										Table_Footer($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_42 = $.comment();
												var node_86 = $.first_child(fragment_42);

												$.component(node_86, () => Table.Row, ($$anchor, Table_Row_14) => {
													Table_Row_14($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_43 = root_6();
															var node_87 = $.first_child(fragment_43);

															$.component(node_87, () => Table.Cell, ($$anchor, Table_Cell_31) => {
																Table_Cell_31($$anchor, {
																	class: 'text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 font-medium',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_48 = $.text('Subtotal');

																		$.append($$anchor, text_48);
																	},
																	$$slots: { default: true }
																});
															});

															var node_88 = $.sibling(node_87, 2);

															$.component(node_88, () => Table.Cell, ($$anchor, Table_Cell_32) => {
																Table_Cell_32($$anchor, {});
															});

															var node_89 = $.sibling(node_88, 2);

															$.component(node_89, () => Table.Cell, ($$anchor, Table_Cell_33) => {
																Table_Cell_33($$anchor, {});
															});

															var node_90 = $.sibling(node_89, 2);

															$.component(node_90, () => Table.Cell, ($$anchor, Table_Cell_34) => {
																Table_Cell_34($$anchor, {
																	class: 'text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 font-medium',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_49 = $.text();

																		$.template_effect(($0) => $.set_text(text_49, $0), [
																			() => formatCurrency(items.reduce((sum, val) => sum + val.charge, 0))
																		]);

																		$.append($$anchor, text_49);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_43);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_42);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_31);
								},
								$$slots: { default: true }
							});
						});

						$.reset(div_10);
						$.append($$anchor, div_10);
					};

					var node_91 = $.child(div_9);

					demoAndCode(node_91, () => demo, () => tableFull);
					$.reset(div_9);
				}

				$.append($$anchor, fragment_30);
			},
			$$slots: { default: true }
		});
	};

	const cont = ($$anchor) => {
		var fragment_47 = root_7();
		var node_92 = $.first_child(fragment_47);

		table(node_92);

		var node_93 = $.sibling(node_92, 2);

		defaultTable(node_93);

		var node_94 = $.sibling(node_93, 2);

		striped(node_94);

		var node_95 = $.sibling(node_94, 2);

		interactive(node_95);

		var node_96 = $.sibling(node_95, 2);

		full(node_96);

		var node_97 = $.sibling(node_96, 2);

		prevAndNext(node_97);
		$.append($$anchor, fragment_47);
	};

	const formatter = new Intl.NumberFormat("en-US", { style: "currency", maximumFractionDigits: 2, currency: "usd" });

	function formatCurrency(amount) {
		return formatter.format(amount);
	}

	const items = [
		{
			product: "Brake Pads Set",
			usage: "100 sets",
			price: "$50 per set",
			charge: 5000
		},

		{
			product: "Oil Filters",
			usage: "200 filters",
			price: "$10 per filter",
			charge: 2000
		},

		{
			product: "Car Batteries",
			usage: "50 batteries",
			price: "$100 per battery",
			charge: 5000
		},

		{
			product: "Headlight Bulbs",
			usage: "300 bulbs",
			price: "$15 per bulb",
			charge: 4500
		},

		{
			product: "Windshield Wipers",
			usage: "250 pairs",
			price: "$20 per pair",
			charge: 5000
		},

		{
			product: "Spark Plugs",
			usage: "500 sets",
			price: "$5 per set",
			charge: 2500
		}
	];

	$.head('zpsvtz', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Table';
		});
	});

	Shell($$anchor, {
		get asideSlot() {
			return aside;
		},

		get contSlot() {
			return cont;
		}
	});

	$.pop();
}