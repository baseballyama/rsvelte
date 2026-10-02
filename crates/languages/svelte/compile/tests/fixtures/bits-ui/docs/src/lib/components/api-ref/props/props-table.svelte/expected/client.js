import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Table from "$lib/components/ui/table/index.js";
import Code from "$lib/components/markdown/code.svelte";
import PropsRequiredBadge from "./props-required-badge.svelte";
import PropsBindableBadge from "./props-bindable-badge.svelte";
import { parseMarkdown } from "$lib/utils/markdown.js";
import PropsTypeContent from "./props-type-content.svelte";
import PropsTypeContentMobile from "./props-type-content-mobile.svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<span aria-hidden="true">&nbsp;——</span> <span class="sr-only">undefined</span>`, 1);
var root_3 = $.from_html(`Default: <!>`, 1);
var root_4 = $.from_html(`<p class="text-sm leading-[1.5rem]"></p> <div class="mt-2"><!></div>`, 1);
var root_5 = $.from_html(`<!> <!>`, 1);

export default function Props_table($$anchor, $$props) {
	$.push($$props, true);

	const propData = $.derived(() => {
		if (!$$props.props) return [];

		return Object.entries($$props.props).map(([name, prop]) => {
			return { name, ...prop };
		});
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_3 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => Table.Root, ($$anchor, Table_Root) => {
				Table_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_5();
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
														class: 'w-[90%] whitespace-nowrap pr-1 sm:w-[38%]',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text = $.text('Property');

															$.append($$anchor, text);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => Table.Head, ($$anchor, Table_Head_1) => {
													Table_Head_1($$anchor, {
														class: 'hidden w-[22%] whitespace-nowrap pr-1 sm:table-cell',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Type');

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
														class: 'sr-only w-[10%] sm:hidden',
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

									$.each(node_9, 19, () => $.get(propData), (p, i) => p.name + i, ($$anchor, p) => {
										var fragment_6 = $.comment();
										var node_10 = $.first_child(fragment_6);

										$.component(node_10, () => Table.Row, ($$anchor, Table_Row_1) => {
											Table_Row_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = root();
													var node_11 = $.first_child(fragment_7);

													$.component(node_11, () => Table.Cell, ($$anchor, Table_Cell) => {
														Table_Cell($$anchor, {
															class: 'flex items-center gap-1 pr-1 align-baseline',
															children: ($$anchor, $$slotProps) => {
																var fragment_8 = root_1();
																var node_12 = $.first_child(fragment_8);

																Code(node_12, {
																	class: 'text-foreground h-fit py-1.5 font-semibold sm:h-[27px] sm:py-0',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_4 = $.text();

																		$.template_effect(() => $.set_text(text_4, $.get(p).name));
																		$.append($$anchor, text_4);
																	},
																	$$slots: { default: true }
																});

																var node_13 = $.sibling(node_12, 2);

																{
																	var consequent = ($$anchor) => {
																		PropsRequiredBadge($$anchor, { class: 'hidden sm:block' });
																	};

																	$.if(node_13, ($$render) => {
																		if ($.get(p).required) $$render(consequent);
																	});
																}

																var node_14 = $.sibling(node_13, 2);

																{
																	var consequent_1 = ($$anchor) => {
																		PropsBindableBadge($$anchor, { class: 'hidden sm:block' });
																	};

																	$.if(node_14, ($$render) => {
																		if ($.get(p).bindable) $$render(consequent_1);
																	});
																}

																$.append($$anchor, fragment_8);
															},
															$$slots: { default: true }
														});
													});

													var node_15 = $.sibling(node_11, 2);

													$.component(node_15, () => Table.Cell, ($$anchor, Table_Cell_1) => {
														Table_Cell_1($$anchor, {
															class: 'hidden pr-1 align-baseline sm:table-cell',
															children: ($$anchor, $$slotProps) => {
																PropsTypeContent($$anchor, {
																	get prop() {
																		return $.get(p);
																	}
																});
															},
															$$slots: { default: true }
														});
													});

													var node_16 = $.sibling(node_15, 2);

													$.component(node_16, () => Table.Cell, ($$anchor, Table_Cell_2) => {
														Table_Cell_2($$anchor, {
															class: 'hidden align-baseline sm:table-cell',
															children: ($$anchor, $$slotProps) => {
																var fragment_13 = root_4();
																var p_1 = $.first_child(fragment_13);

																$.html(p_1, () => parseMarkdown($.get(p).description), true);
																$.reset(p_1);

																var div = $.sibling(p_1, 2);
																var node_17 = $.child(div);

																Code(node_17, {
																	class: 'bg-background h-auto px-0',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var fragment_14 = root_3();
																		var node_18 = $.sibling($.first_child(fragment_14));

																		{
																			var consequent_2 = ($$anchor) => {
																				var text_5 = $.text();

																				$.template_effect(() => $.set_text(text_5, ` ${$.get(p).default.value}`));
																				$.append($$anchor, text_5);
																			};

																			var alternate = ($$anchor) => {
																				var fragment_16 = root_2();

																				$.next(2);
																				$.append($$anchor, fragment_16);
																			};

																			$.if(node_18, ($$render) => {
																				if ($.get(p).default) $$render(consequent_2); else $$render(alternate, -1);
																			});
																		}

																		$.append($$anchor, fragment_14);
																	},
																	$$slots: { default: true }
																});

																$.reset(div);
																$.append($$anchor, fragment_13);
															},
															$$slots: { default: true }
														});
													});

													var node_19 = $.sibling(node_16, 2);

													$.component(node_19, () => Table.Cell, ($$anchor, Table_Cell_3) => {
														Table_Cell_3($$anchor, {
															class: 'overflow-hidden py-0 sm:hidden',
															children: ($$anchor, $$slotProps) => {
																PropsTypeContentMobile($$anchor, {
																	get prop() {
																		return $.get(p);
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
			if ($.get(propData).length) $$render(consequent_3);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}