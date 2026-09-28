import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import * as Pagination from "$lib/registry/ui/pagination/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex items-center justify-between gap-4"><!> <!></div>`);

export default function Pagination_with_select($$anchor) {
	let selectedValue = $.state("25");
	const selectedLabel = $.derived(() => $.get(selectedValue));

	Example($$anchor, {
		title: 'With Select',
		children: ($$anchor, $$slotProps) => {
			var div = root_2();
			var node = $.child(div);

			$.component(node, () => Field.Field, ($$anchor, Field_Field) => {
				Field_Field($$anchor, {
					orientation: 'horizontal',
					class: 'w-fit',
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_1();
						var node_1 = $.first_child(fragment_1);

						$.component(node_1, () => Field.Label, ($$anchor, Field_Label) => {
							Field_Label($$anchor, {
								for: 'select-rows-per-page',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Rows per page');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Select.Root, ($$anchor, Select_Root) => {
							Select_Root($$anchor, {
								type: 'single',
								get value() {
									return $.get(selectedValue);
								},

								set value($$value) {
									$.set(selectedValue, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_2 = root_1();
									var node_3 = $.first_child(fragment_2);

									$.component(node_3, () => Select.Trigger, ($$anchor, Select_Trigger) => {
										Select_Trigger($$anchor, {
											class: 'w-20',
											id: 'select-rows-per-page',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text();

												$.template_effect(() => $.set_text(text_1, $.get(selectedLabel)));
												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									var node_4 = $.sibling(node_3, 2);

									$.component(node_4, () => Select.Content, ($$anchor, Select_Content) => {
										Select_Content($$anchor, {
											align: 'start',
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = $.comment();
												var node_5 = $.first_child(fragment_4);

												$.component(node_5, () => Select.Group, ($$anchor, Select_Group) => {
													Select_Group($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root();
															var node_6 = $.first_child(fragment_5);

															$.component(node_6, () => Select.Item, ($$anchor, Select_Item) => {
																Select_Item($$anchor, {
																	value: '10',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('10');

																		$.append($$anchor, text_2);
																	},
																	$$slots: { default: true }
																});
															});

															var node_7 = $.sibling(node_6, 2);

															$.component(node_7, () => Select.Item, ($$anchor, Select_Item_1) => {
																Select_Item_1($$anchor, {
																	value: '25',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text('25');

																		$.append($$anchor, text_3);
																	},
																	$$slots: { default: true }
																});
															});

															var node_8 = $.sibling(node_7, 2);

															$.component(node_8, () => Select.Item, ($$anchor, Select_Item_2) => {
																Select_Item_2($$anchor, {
																	value: '50',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_4 = $.text('50');

																		$.append($$anchor, text_4);
																	},
																	$$slots: { default: true }
																});
															});

															var node_9 = $.sibling(node_8, 2);

															$.component(node_9, () => Select.Item, ($$anchor, Select_Item_3) => {
																Select_Item_3($$anchor, {
																	value: '100',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_5 = $.text('100');

																		$.append($$anchor, text_5);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_5);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_2);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var node_10 = $.sibling(node, 2);

			$.component(node_10, () => Pagination.Root, ($$anchor, Pagination_Root) => {
				Pagination_Root($$anchor, {
					page: 2,
					count: 100,
					class: 'mx-0 w-auto',
					children: ($$anchor, $$slotProps) => {
						var fragment_6 = $.comment();
						var node_11 = $.first_child(fragment_6);

						$.component(node_11, () => Pagination.Content, ($$anchor, Pagination_Content) => {
							Pagination_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_1();
									var node_12 = $.first_child(fragment_7);

									$.component(node_12, () => Pagination.Item, ($$anchor, Pagination_Item) => {
										Pagination_Item($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = $.comment();
												var node_13 = $.first_child(fragment_8);

												$.component(node_13, () => Pagination.PrevButton, ($$anchor, Pagination_PrevButton) => {
													Pagination_PrevButton($$anchor, {});
												});

												$.append($$anchor, fragment_8);
											},
											$$slots: { default: true }
										});
									});

									var node_14 = $.sibling(node_12, 2);

									$.component(node_14, () => Pagination.Item, ($$anchor, Pagination_Item_1) => {
										Pagination_Item_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_9 = $.comment();
												var node_15 = $.first_child(fragment_9);

												$.component(node_15, () => Pagination.NextButton, ($$anchor, Pagination_NextButton) => {
													Pagination_NextButton($$anchor, {});
												});

												$.append($$anchor, fragment_9);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_6);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}