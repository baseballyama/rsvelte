import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from "$app/navigation";
import { onMount } from "svelte";
import * as Table from "$lib/components/ui/table/index.js";
import * as Avatar from "$lib/components/ui/avatar/index.js";
import { Badge } from "$lib/components/ui/badge/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import Plus from "@lucide/svelte/icons/plus";
import SettingsIcon from "@lucide/svelte/icons/settings";
import * as Item from "$lib/components/ui/item/index.js";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

var root = $.from_html(`<!> New Page`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex w-full flex-col gap-4 [--radius:1rem]"><!></div>`);
var root_3 = $.from_html(`<div class="text-destructive py-8 text-center"> </div>`);
var root_4 = $.from_html(`<div class="text-muted-foreground py-8 text-center">No pages found. Create your first page to get started.</div>`);
var root_5 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_6 = $.from_html(`<div class="flex items-start gap-3"><!> <div class="min-w-0"><div class="font-medium"> </div> <p class="text-muted-foreground line-clamp-2 text-xs"> </p></div></div>`);
var root_7 = $.from_html(`<div class="ktable rounded-xl border"><!></div>`);
var root_8 = $.from_html(`<div class="flex w-full flex-col gap-4 p-4"><div class="mb-4 flex justify-end"><!></div> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let pages = $.state($.proxy([]));
	let loading = $.state(true);
	let error = $.state(null);

	async function fetchPages() {
		$.set(loading, true);
		$.set(error, null);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "getPages" })
			});

			const result = await response.json();

			if (result.error) {
				$.set(error, result.error, true);
			} else {
				$.set(pages, result, true);
			}
		} catch(e) {
			$.set(error, e instanceof Error ? e.message : "Failed to fetch pages", true);
		} finally {
			$.set(loading, false);
		}
	}

	onMount(() => {
		fetchPages();
	});

	var div = root_8();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Button(node, {
		class: 'cursor-pointer',
		onclick: () => goto(clientResolver(resolve, "/manage/app/pages/new")),
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Plus(node_1, { class: 'size-4' });
			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var node_2 = $.sibling(div_1, 2);

	{
		var consequent = ($$anchor) => {
			var div_2 = root_2();
			var node_3 = $.child(div_2);

			$.component(node_3, () => Item.Root, ($$anchor, Item_Root) => {
				Item_Root($$anchor, {
					variant: 'muted',
					class: 'mx-auto',
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_1();
						var node_4 = $.first_child(fragment_1);

						$.component(node_4, () => Item.Media, ($$anchor, Item_Media) => {
							Item_Media($$anchor, {
								children: ($$anchor, $$slotProps) => {
									Spinner($$anchor, {});
								},
								$$slots: { default: true }
							});
						});

						var node_5 = $.sibling(node_4, 2);

						$.component(node_5, () => Item.Content, ($$anchor, Item_Content) => {
							Item_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_6 = $.first_child(fragment_3);

									$.component(node_6, () => Item.Title, ($$anchor, Item_Title) => {
										Item_Title($$anchor, {
											class: 'line-clamp-1',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Loading Pages....');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		var consequent_1 = ($$anchor) => {
			var div_3 = root_3();
			var text_1 = $.only_child(div_3, true);

			$.template_effect(() => $.set_text(text_1, $.get(error)));
			$.append($$anchor, div_3);
		};

		var consequent_2 = ($$anchor) => {
			var div_4 = root_4();

			$.append($$anchor, div_4);
		};

		var alternate_1 = ($$anchor) => {
			var div_5 = root_7();
			var node_7 = $.child(div_5);

			$.component(node_7, () => Table.Root, ($$anchor, Table_Root) => {
				Table_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root_1();
						var node_8 = $.first_child(fragment_4);

						$.component(node_8, () => Table.Header, ($$anchor, Table_Header) => {
							Table_Header($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = $.comment();
									var node_9 = $.first_child(fragment_5);

									$.component(node_9, () => Table.Row, ($$anchor, Table_Row) => {
										Table_Row($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root_5();
												var node_10 = $.first_child(fragment_6);

												$.component(node_10, () => Table.Head, ($$anchor, Table_Head) => {
													Table_Head($$anchor, {
														class: 'w-[340px]',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Page');

															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												});

												var node_11 = $.sibling(node_10, 2);

												$.component(node_11, () => Table.Head, ($$anchor, Table_Head_1) => {
													Table_Head_1($$anchor, {
														class: 'w-[220px]',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('Path');

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});

												var node_12 = $.sibling(node_11, 2);

												$.component(node_12, () => Table.Head, ($$anchor, Table_Head_2) => {
													Table_Head_2($$anchor, {
														class: 'w-[150px]',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_4 = $.text('Monitors');

															$.append($$anchor, text_4);
														},
														$$slots: { default: true }
													});
												});

												var node_13 = $.sibling(node_12, 2);

												$.component(node_13, () => Table.Head, ($$anchor, Table_Head_3) => {
													Table_Head_3($$anchor, { class: 'w-[120px] text-right' });
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

						var node_14 = $.sibling(node_8, 2);

						$.component(node_14, () => Table.Body, ($$anchor, Table_Body) => {
							Table_Body($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = $.comment();
									var node_15 = $.first_child(fragment_7);

									$.each(node_15, 17, () => $.get(pages), (page) => page.id, ($$anchor, page) => {
										var fragment_8 = $.comment();
										var node_16 = $.first_child(fragment_8);

										$.component(node_16, () => Table.Row, ($$anchor, Table_Row_1) => {
											Table_Row_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_9 = root_5();
													var node_17 = $.first_child(fragment_9);

													$.component(node_17, () => Table.Cell, ($$anchor, Table_Cell) => {
														Table_Cell($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var div_6 = root_6();
																var node_18 = $.child(div_6);

																$.component(node_18, () => Avatar.Root, ($$anchor, Avatar_Root) => {
																	Avatar_Root($$anchor, {
																		class: 'size-8 rounded-sm',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_10 = root_1();
																			var node_19 = $.first_child(fragment_10);

																			{
																				var consequent_3 = ($$anchor) => {
																					var fragment_11 = $.comment();
																					var node_20 = $.first_child(fragment_11);

																					{
																						let $0 = $.derived(() => clientResolver(resolve, $.get(page).page_logo));

																						$.component(node_20, () => Avatar.Image, ($$anchor, Avatar_Image) => {
																							Avatar_Image($$anchor, {
																								get src() {
																									return $.get($0);
																								},

																								get alt() {
																									return $.get(page).page_title;
																								}
																							});
																						});
																					}

																					$.append($$anchor, fragment_11);
																				};

																				$.if(node_19, ($$render) => {
																					if ($.get(page).page_logo) $$render(consequent_3);
																				});
																			}

																			var node_21 = $.sibling(node_19, 2);

																			$.component(node_21, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
																				Avatar_Fallback($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_5 = $.text();

																						$.template_effect(($0) => $.set_text(text_5, $0), [() => $.get(page).page_title.charAt(0).toUpperCase()]);
																						$.append($$anchor, text_5);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_10);
																		},
																		$$slots: { default: true }
																	});
																});

																var div_7 = $.sibling(node_18, 2);
																var div_8 = $.child(div_7);
																var text_6 = $.only_child(div_8, true);
																var p = $.sibling(div_8, 2);
																var text_7 = $.only_child(p, true);

																$.reset(div_7);
																$.reset(div_6);

																$.template_effect(() => {
																	$.set_text(text_6, $.get(page).page_title);
																	$.set_text(text_7, $.get(page).page_header);
																});

																$.append($$anchor, div_6);
															},
															$$slots: { default: true }
														});
													});

													var node_22 = $.sibling(node_17, 2);

													$.component(node_22, () => Table.Cell, ($$anchor, Table_Cell_1) => {
														Table_Cell_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																{
																	let $0 = $.derived(() => clientResolver(resolve, `/${$.get(page).page_path}`));

																	Button($$anchor, {
																		variant: 'link',
																		class: 'h-auto px-0',
																		get href() {
																			return $.get($0);
																		},
																		target: '_blank',
																		rel: 'noopener noreferrer',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_8 = $.text();

																			$.template_effect(() => $.set_text(text_8, `/${$.get(page).page_path ?? ''}`));
																			$.append($$anchor, text_8);
																		},
																		$$slots: { default: true }
																	});
																}
															},
															$$slots: { default: true }
														});
													});

													var node_23 = $.sibling(node_22, 2);

													$.component(node_23, () => Table.Cell, ($$anchor, Table_Cell_2) => {
														Table_Cell_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_15 = $.comment();
																var node_24 = $.first_child(fragment_15);

																{
																	var consequent_4 = ($$anchor) => {
																		Badge($$anchor, {
																			variant: 'secondary',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_9 = $.text();

																				$.template_effect(() => $.set_text(text_9, `${$.get(page).monitors.length ?? ''} monitor${$.get(page).monitors.length > 1 ? "s" : ""}`));
																				$.append($$anchor, text_9);
																			},
																			$$slots: { default: true }
																		});
																	};

																	var alternate = ($$anchor) => {
																		Badge($$anchor, {
																			variant: 'outline',
																			class: 'text-muted-foreground',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_10 = $.text('No monitors');

																				$.append($$anchor, text_10);
																			},
																			$$slots: { default: true }
																		});
																	};

																	$.if(node_24, ($$render) => {
																		if ($.get(page).monitors && $.get(page).monitors.length > 0) $$render(consequent_4); else $$render(alternate, -1);
																	});
																}

																$.append($$anchor, fragment_15);
															},
															$$slots: { default: true }
														});
													});

													var node_25 = $.sibling(node_23, 2);

													$.component(node_25, () => Table.Cell, ($$anchor, Table_Cell_3) => {
														Table_Cell_3($$anchor, {
															class: 'text-right',
															children: ($$anchor, $$slotProps) => {
																var fragment_19 = root_1();
																var node_26 = $.first_child(fragment_19);

																{
																	let $0 = $.derived(() => clientResolver(resolve, `/${$.get(page).page_path}`));

																	Button(node_26, {
																		variant: 'ghost',
																		target: '_blank',
																		size: 'sm',
																		get href() {
																			return $.get($0);
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_11 = $.text('View');

																			$.append($$anchor, text_11);
																		},
																		$$slots: { default: true }
																	});
																}

																var node_27 = $.sibling(node_26, 2);

																Button(node_27, {
																	variant: 'outline',
																	size: 'sm',
																	onclick: () => goto(clientResolver(resolve, `/manage/app/pages/${$.get(page).id}`)),
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_12 = $.text('Edit');

																		$.append($$anchor, text_12);
																	},
																	$$slots: { default: true }
																});

																$.append($$anchor, fragment_19);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_9);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_8);
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

			$.reset(div_5);
			$.append($$anchor, div_5);
		};

		$.if(node_2, ($$render) => {
			if ($.get(loading)) $$render(consequent); else if ($.get(error)) $$render(consequent_1, 1); else if ($.get(pages).length === 0) $$render(consequent_2, 2); else $$render(alternate_1, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}