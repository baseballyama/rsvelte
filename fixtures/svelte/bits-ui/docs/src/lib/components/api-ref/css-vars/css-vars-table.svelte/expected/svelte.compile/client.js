import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Code from "$lib/components/markdown/code.svelte";
import * as Table from "$lib/components/ui/table/index.js";
import { parseMarkdown } from "$lib/utils/index.js";
import CssVarsDetailsMobile from "./css-vars-details-mobile.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<p class="my-2 text-sm leading-7"></p>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Css_vars_table($$anchor, $$props) {
	$.push($$props, true);

	let cssVars = $.prop($$props, 'cssVars', 19, () => []);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
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
											class: 'w-1/4',
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => Table.Head, ($$anchor, Table_Head) => {
													Table_Head($$anchor, {
														class: 'w-[90%] whitespace-nowrap sm:w-[60%]',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text = $.text('CSS Variable');

															$.append($$anchor, text);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => Table.Head, ($$anchor, Table_Head_1) => {
													Table_Head_1($$anchor, {
														class: 'hidden w-[40%] whitespace-nowrap sm:table-cell',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Description');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_6 = $.sibling(node_5, 2);

												$.component(node_6, () => Table.Head, ($$anchor, Table_Head_2) => {
													Table_Head_2($$anchor, {
														class: 'sr-only w-[10%] sm:hidden',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Details');

															$.append($$anchor, text_2);
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

						var node_7 = $.sibling(node_2, 2);

						$.component(node_7, () => Table.Body, ($$anchor, Table_Body) => {
							Table_Body($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = $.comment();
									var node_8 = $.first_child(fragment_5);

									$.each(node_8, 17, cssVars, (attr) => attr.name, ($$anchor, attr) => {
										var fragment_6 = $.comment();
										var node_9 = $.first_child(fragment_6);

										$.component(node_9, () => Table.Row, ($$anchor, Table_Row_1) => {
											Table_Row_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = root();
													var node_10 = $.first_child(fragment_7);

													$.component(node_10, () => Table.Cell, ($$anchor, Table_Cell) => {
														Table_Cell($$anchor, {
															class: 'align-baseline',
															children: ($$anchor, $$slotProps) => {
																Code($$anchor, {
																	class: 'text-foreground h-fit py-1.5 font-semibold md:py-1 lg:h-[27px] lg:py-0',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text();

																		$.template_effect(() => $.set_text(text_3, $.get(attr).name));
																		$.append($$anchor, text_3);
																	},
																	$$slots: { default: true }
																});
															},
															$$slots: { default: true }
														});
													});

													var node_11 = $.sibling(node_10, 2);

													$.component(node_11, () => Table.Cell, ($$anchor, Table_Cell_1) => {
														Table_Cell_1($$anchor, {
															class: 'hidden align-baseline sm:table-cell',
															children: ($$anchor, $$slotProps) => {
																var fragment_10 = $.comment();
																var node_12 = $.first_child(fragment_10);

																{
																	var consequent = ($$anchor) => {
																		var p = root_1();

																		$.html(p, () => parseMarkdown($.get(attr).description), true);
																		$.reset(p);
																		$.append($$anchor, p);
																	};

																	$.if(node_12, ($$render) => {
																		if ($.get(attr).description) $$render(consequent);
																	});
																}

																$.append($$anchor, fragment_10);
															},
															$$slots: { default: true }
														});
													});

													var node_13 = $.sibling(node_11, 2);

													$.component(node_13, () => Table.Cell, ($$anchor, Table_Cell_2) => {
														Table_Cell_2($$anchor, {
															class: 'overflow-hidden py-0 sm:hidden',
															children: ($$anchor, $$slotProps) => {
																CssVarsDetailsMobile($$anchor, {
																	get cssVar() {
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
			if (cssVars().length) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}