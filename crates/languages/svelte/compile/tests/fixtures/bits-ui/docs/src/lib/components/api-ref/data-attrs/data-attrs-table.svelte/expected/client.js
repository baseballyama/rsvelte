import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Code from "$lib/components/markdown/code.svelte";
import * as Table from "$lib/components/ui/table/index.js";
import { parseMarkdown } from "$lib/utils/index.js";
import DataAttrsValueContentMobile from "./data-attrs-value-content-mobile.svelte";
import DataAttrValueContent from "./data-attrs-value-content.svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<p class="text-sm leading-[1.5rem]"></p>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Data_attrs_table($$anchor, $$props) {
	$.push($$props, true);

	let dataAttrs = $.prop($$props, 'dataAttrs', 19, () => []);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => Table.Root, ($$anchor, Table_Root) => {
				Table_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => Table.Header, ($$anchor, Table_Header) => {
							Table_Header($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => Table.Row, ($$anchor, Table_Row) => {
										Table_Row($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => Table.Head, ($$anchor, Table_Head) => {
													Table_Head($$anchor, {
														class: 'w-[90%] whitespace-nowrap sm:w-[38%]',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text = $.text('Data Attribute');

															$.append($$anchor, text);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => Table.Head, ($$anchor, Table_Head_1) => {
													Table_Head_1($$anchor, {
														class: 'hidden w-[22%] whitespace-nowrap sm:table-cell',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Value');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_6 = $.sibling(node_5, 2);

												$.component(node_6, () => Table.Head, ($$anchor, Table_Head_2) => {
													Table_Head_2($$anchor, {
														class: 'hidden w-[40%] whitespace-nowrap sm:table-cell',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Description');

															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												});

												var node_7 = $.sibling(node_6, 2);

												$.component(node_7, () => Table.Head, ($$anchor, Table_Head_3) => {
													Table_Head_3($$anchor, {
														class: 'sr-only w-[10%] whitespace-nowrap sm:hidden',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('Details');

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_8 = $.sibling(node_2, 2);

						$.component(node_8, () => Table.Body, ($$anchor, Table_Body) => {
							Table_Body($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = $.comment();
									var node_9 = $.first_child(fragment_5);

									$.each(node_9, 17, dataAttrs, (attr) => attr.name, ($$anchor, attr) => {
										var fragment_6 = $.comment();
										var node_10 = $.first_child(fragment_6);

										$.component(node_10, () => Table.Row, ($$anchor, Table_Row_1) => {
											Table_Row_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = root();
													var node_11 = $.first_child(fragment_7);

													$.component(node_11, () => Table.Cell, ($$anchor, Table_Cell) => {
														Table_Cell($$anchor, {
															class: 'align-baseline',
															children: ($$anchor, $$slotProps) => {
																Code($$anchor, {
																	class: 'text-foreground h-fit py-1.5 font-semibold md:py-1 lg:h-[27px] lg:py-0',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_4 = $.text();

																		$.template_effect(() => $.set_text(text_4, `data-${$.get(attr).name ?? ''}`));
																		$.append($$anchor, text_4);
																	},
																	$$slots: { default: true }
																});
															},
															$$slots: { default: true }
														});
													});

													var node_12 = $.sibling(node_11, 2);

													$.component(node_12, () => Table.Cell, ($$anchor, Table_Cell_1) => {
														Table_Cell_1($$anchor, {
															class: 'hidden pr-1 align-baseline sm:table-cell',
															children: ($$anchor, $$slotProps) => {
																DataAttrValueContent($$anchor, {
																	get attr() {
																		return $.get(attr);
																	}
																});
															},
															$$slots: { default: true }
														});
													});

													var node_13 = $.sibling(node_12, 2);

													$.component(node_13, () => Table.Cell, ($$anchor, Table_Cell_2) => {
														Table_Cell_2($$anchor, {
															class: 'hidden align-baseline sm:table-cell',
															children: ($$anchor, $$slotProps) => {
																var p = root_1();

																$.html(p, () => parseMarkdown($.get(attr).description), true);
																$.reset(p);
																$.append($$anchor, p);
															},
															$$slots: { default: true }
														});
													});

													var node_14 = $.sibling(node_13, 2);

													$.component(node_14, () => Table.Cell, ($$anchor, Table_Cell_3) => {
														Table_Cell_3($$anchor, {
															class: 'overflow-hidden py-0 sm:hidden',
															children: ($$anchor, $$slotProps) => {
																DataAttrsValueContentMobile($$anchor, {
																	get attr() {
																		return $.get(attr);
																	}
																});
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
									});

									$.append($$anchor, fragment_5);
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
		};

		$.if(node, ($$render) => {
			if (dataAttrs().length) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}