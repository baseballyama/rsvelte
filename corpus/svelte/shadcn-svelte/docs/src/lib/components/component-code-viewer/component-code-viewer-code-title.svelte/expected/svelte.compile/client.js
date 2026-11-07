import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Select from "$lib/registry/ui/select/index.js";
import ComponentCodeViewerCopyCodeButton from "./component-code-viewer-copy-code-button.svelte";
import { ComponentCodeViewerContext } from "./component-code-viewer.svelte";
import { getIconForLanguageExtension } from "../icons/icons.js";

var root = $.from_html(`<!> `, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex h-12 shrink-0 items-center gap-2 border-b px-2 py-2 text-code-foreground select-none [&amp;_svg]:size-4 [&amp;_svg]:text-code-foreground [&amp;_svg]:opacity-70"><!> <div class="ms-auto flex items-center gap-2"><!></div></div>`);
var root_3 = $.from_html(`<div class="flex h-12 shrink-0 items-center gap-2 border-b px-2 py-2 text-code-foreground md:hidden [&amp;_svg]:size-4 [&amp;_svg]:text-code-foreground [&amp;_svg]:opacity-70"><!> <div class="ms-auto flex items-center gap-2"><!></div></div>`);
var root_4 = $.from_html(`<figcaption class="hidden h-12 shrink-0 items-center gap-2 border-b px-4 py-2 text-code-foreground select-none md:flex [&amp;_svg]:size-4 [&amp;_svg]:text-code-foreground [&amp;_svg]:opacity-70"><!> <div class="ms-auto flex items-center gap-2"><!></div></figcaption> <!>`, 1);

export default function Component_code_viewer_code_title($$anchor, $$props) {
	$.push($$props, true);

	const ctx = ComponentCodeViewerContext.get();
	const file = $.derived(() => ctx.highlightedFiles?.find((f) => f.target === ctx.activeFile) ?? null);
	const language = $.derived(() => $.get(file)?.target?.split(".").pop() ?? "svelte");
	const Icon = $.derived(() => getIconForLanguageExtension($.get(language)));
	const showFileTree = $.derived(() => ctx.allowSidebar !== false);
	const hideSidebar = $.derived(() => ctx.allowSidebar === false);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_6 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent_2 = ($$anchor) => {
					var div = root_2();
					var node_2 = $.child(div);
					var bind_get = () => ctx.activeFile ?? "";
					var bind_set = (v) => ctx.activeFile = v;

					$.component(node_2, () => Select.Root, ($$anchor, Select_Root) => {
						Select_Root($$anchor, {
							type: 'single',
							get value() {
								return bind_get();
							},

							set value($$value) {
								bind_set($$value);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root_1();
								var node_3 = $.first_child(fragment_2);

								$.component(node_3, () => Select.Trigger, ($$anchor, Select_Trigger) => {
									Select_Trigger($$anchor, {
										class: 'w-76 justify-start [&>svg]:ms-auto',
										children: ($$anchor, $$slotProps) => {
											var fragment_3 = root();
											var node_4 = $.first_child(fragment_3);

											$.component(node_4, () => $.get(Icon), ($$anchor, Icon_1) => {
												Icon_1($$anchor, { class: '!ms-0' });
											});

											var text = $.sibling(node_4);

											$.template_effect(($0) => $.set_text(text, ` ${$0 ?? ''}`), [() => $.get(file).target.split("/").pop()]);
											$.append($$anchor, fragment_3);
										},
										$$slots: { default: true }
									});
								});

								var node_5 = $.sibling(node_3, 2);

								$.component(node_5, () => Select.Content, ($$anchor, Select_Content) => {
									Select_Content($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = $.comment();
											var node_6 = $.first_child(fragment_4);

											{
												var consequent_1 = ($$anchor) => {
													const tree = $.derived(() => ctx.tree[0]);
													var fragment_5 = $.comment();
													var node_7 = $.first_child(fragment_5);

													{
														var consequent = ($$anchor) => {
															var fragment_6 = $.comment();
															var node_8 = $.first_child(fragment_6);

															$.each(node_8, 17, () => $.get(tree).children, (file) => file.name, ($$anchor, file, $$index, $$array) => {
																var fragment_7 = $.comment();
																var node_9 = $.first_child(fragment_7);

																{
																	let $0 = $.derived(() => $.get(file).path ?? "");

																	$.component(node_9, () => Select.Item, ($$anchor, Select_Item) => {
																		Select_Item($$anchor, {
																			get value() {
																				return $.get($0);
																			},

																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_1 = $.text();

																				$.template_effect(() => $.set_text(text_1, $.get(file).name));
																				$.append($$anchor, text_1);
																			},
																			$$slots: { default: true }
																		});
																	});
																}

																$.append($$anchor, fragment_7);
															});

															$.append($$anchor, fragment_6);
														};

														$.if(node_7, ($$render) => {
															if ($.get(tree) && $.get(tree).children) $$render(consequent);
														});
													}

													$.append($$anchor, fragment_5);
												};

												$.if(node_6, ($$render) => {
													if (ctx.tree) $$render(consequent_1);
												});
											}

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

					var div_1 = $.sibling(node_2, 2);
					var node_10 = $.child(div_1);

					ComponentCodeViewerCopyCodeButton(node_10, {});
					$.reset(div_1);
					$.reset(div);
					$.template_effect(() => $.set_attribute(div, 'data-language', $.get(language)));
					$.append($$anchor, div);
				};

				var alternate = ($$anchor) => {
					var fragment_9 = root_4();
					var figcaption = $.first_child(fragment_9);
					var node_11 = $.child(figcaption);

					$.component(node_11, () => $.get(Icon), ($$anchor, Icon_2) => {
						Icon_2($$anchor, {});
					});

					var text_2 = $.sibling(node_11);
					var div_2 = $.sibling(text_2);
					var node_12 = $.child(div_2);

					ComponentCodeViewerCopyCodeButton(node_12, {});
					$.reset(div_2);
					$.reset(figcaption);

					var node_13 = $.sibling(figcaption, 2);

					{
						var consequent_5 = ($$anchor) => {
							var div_3 = root_3();
							var node_14 = $.child(div_3);
							var bind_get_1 = () => ctx.activeFile ?? "";
							var bind_set_1 = (v) => ctx.activeFile = v;

							$.component(node_14, () => Select.Root, ($$anchor, Select_Root_1) => {
								Select_Root_1($$anchor, {
									type: 'single',
									get value() {
										return bind_get_1();
									},

									set value($$value) {
										bind_set_1($$value);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_10 = root_1();
										var node_15 = $.first_child(fragment_10);

										$.component(node_15, () => Select.Trigger, ($$anchor, Select_Trigger_1) => {
											Select_Trigger_1($$anchor, {
												class: 'w-76 justify-start [&>svg]:ms-auto',
												children: ($$anchor, $$slotProps) => {
													var fragment_11 = root();
													var node_16 = $.first_child(fragment_11);

													$.component(node_16, () => $.get(Icon), ($$anchor, Icon_3) => {
														Icon_3($$anchor, { class: '!ms-0' });
													});

													var text_3 = $.sibling(node_16);

													$.template_effect(($0) => $.set_text(text_3, ` ${$0 ?? ''}`), [() => $.get(file).target.split("/").pop()]);
													$.append($$anchor, fragment_11);
												},
												$$slots: { default: true }
											});
										});

										var node_17 = $.sibling(node_15, 2);

										$.component(node_17, () => Select.Content, ($$anchor, Select_Content_1) => {
											Select_Content_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_12 = $.comment();
													var node_18 = $.first_child(fragment_12);

													{
														var consequent_4 = ($$anchor) => {
															const tree = $.derived(() => ctx.tree[0]);
															var fragment_13 = $.comment();
															var node_19 = $.first_child(fragment_13);

															{
																var consequent_3 = ($$anchor) => {
																	var fragment_14 = $.comment();
																	var node_20 = $.first_child(fragment_14);

																	$.each(node_20, 17, () => $.get(tree).children, (file) => file.name, ($$anchor, file, $$index_1, $$array_1) => {
																		var fragment_15 = $.comment();
																		var node_21 = $.first_child(fragment_15);

																		{
																			let $0 = $.derived(() => $.get(file).path ?? "");

																			$.component(node_21, () => Select.Item, ($$anchor, Select_Item_1) => {
																				Select_Item_1($$anchor, {
																					get value() {
																						return $.get($0);
																					},

																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_4 = $.text();

																						$.template_effect(() => $.set_text(text_4, $.get(file).name));
																						$.append($$anchor, text_4);
																					},
																					$$slots: { default: true }
																				});
																			});
																		}

																		$.append($$anchor, fragment_15);
																	});

																	$.append($$anchor, fragment_14);
																};

																$.if(node_19, ($$render) => {
																	if ($.get(tree) && $.get(tree).children) $$render(consequent_3);
																});
															}

															$.append($$anchor, fragment_13);
														};

														$.if(node_18, ($$render) => {
															if (ctx.tree) $$render(consequent_4);
														});
													}

													$.append($$anchor, fragment_12);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_10);
									},
									$$slots: { default: true }
								});
							});

							var div_4 = $.sibling(node_14, 2);
							var node_22 = $.child(div_4);

							ComponentCodeViewerCopyCodeButton(node_22, { class: 'me-0' });
							$.reset(div_4);
							$.reset(div_3);
							$.append($$anchor, div_3);
						};

						$.if(node_13, ($$render) => {
							if ($.get(showFileTree)) $$render(consequent_5);
						});
					}

					$.template_effect(
						($0) => {
							$.set_attribute(figcaption, 'data-language', $.get(language));
							$.set_text(text_2, ` ${$0 ?? ''} `);
						},
						[() => $.get(file).target.split("/").pop()]
					);

					$.append($$anchor, fragment_9);
				};

				$.if(node_1, ($$render) => {
					if ($.get(hideSidebar)) $$render(consequent_2); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(file)) $$render(consequent_6);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}