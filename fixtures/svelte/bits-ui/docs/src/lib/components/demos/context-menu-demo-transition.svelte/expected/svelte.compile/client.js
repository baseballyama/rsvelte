import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ContextMenu } from "bits-ui";
import CopySimple from "phosphor-svelte/lib/CopySimple";
import MouseSimple from "phosphor-svelte/lib/MouseSimple";
import PencilSimpleLine from "phosphor-svelte/lib/PencilSimpleLine";
import PlusCircle from "phosphor-svelte/lib/PlusCircle";
import Trash from "phosphor-svelte/lib/Trash";
import { fly } from "svelte/transition";

var root = $.from_html(`<div class="flex flex-col items-center justify-center gap-4 text-center"><!> Right click me</div>`);
var root_1 = $.from_html(`<div class="flex items-center"><!> Edit</div> <div class="ml-auto flex items-center gap-px"><kbd class="rounded-button border-dark-10 bg-background-alt text-muted-foreground shadow-kbd inline-flex size-5 items-center justify-center border text-[13px]">⌘</kbd> <kbd class="rounded-button border-dark-10 bg-background-alt text-muted-foreground shadow-kbd inline-flex size-5 items-center justify-center border text-[11px]">E</kbd></div>`, 1);
var root_2 = $.from_html(`<div class="flex items-center"><!> Add</div> <div class="ml-auto flex items-center gap-px"><kbd class="rounded-button border-dark-10 bg-background-alt text-muted-foreground shadow-kbd inline-flex size-5 items-center justify-center border text-[13px]">⌘</kbd> <kbd class="rounded-button border-dark-10 bg-background-alt text-muted-foreground shadow-kbd inline-flex size-5 items-center justify-center border text-[11px]">N</kbd></div>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`<div class="flex items-center"><!> Duplicate</div> <div class="ml-auto flex items-center gap-px"><kbd class="rounded-button border-dark-10 bg-background-alt text-muted-foreground shadow-kbd inline-flex size-5 items-center justify-center border text-[13px]">⌘</kbd> <kbd class="rounded-button border-dark-10 bg-background-alt text-muted-foreground shadow-kbd inline-flex size-5 items-center justify-center border text-[11px]">D</kbd></div>`, 1);
var root_6 = $.from_html(`<div class="flex items-center"><!> Delete</div>`);
var root_7 = $.from_html(`<div><div><!> <!> <!> <!> <!></div></div>`);

export default function Context_menu_demo_transition($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => ContextMenu.Root, ($$anchor, ContextMenu_Root) => {
		ContextMenu_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_4();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => ContextMenu.Trigger, ($$anchor, ContextMenu_Trigger) => {
					ContextMenu_Trigger($$anchor, {
						class: 'rounded-card border-input text-muted-foreground flex h-[188px] w-[279px] select-none items-center justify-center border-2 border-dashed bg-transparent font-semibold',
						children: ($$anchor, $$slotProps) => {
							var div = root();
							var node_2 = $.child(div);

							MouseSimple(node_2, { class: 'size-8' });
							$.next();
							$.reset(div);
							$.append($$anchor, div);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => ContextMenu.Portal, ($$anchor, ContextMenu_Portal) => {
					ContextMenu_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_4 = $.first_child(fragment_2);

							{
								const child = ($$anchor, $$arg0) => {
									let wrapperProps = () => ($$arg0?.()).wrapperProps;
									let props = () => ($$arg0?.()).props;
									let open = () => ($$arg0?.()).open;
									var fragment_3 = $.comment();
									var node_5 = $.first_child(fragment_3);

									{
										var consequent = ($$anchor) => {
											var div_1 = root_7();

											$.attribute_effect(div_1, () => ({ ...wrapperProps() }));

											var div_2 = $.child(div_1);

											$.attribute_effect(div_2, () => ({ ...props() }));

											var node_6 = $.child(div_2);

											$.component(node_6, () => ContextMenu.Item, ($$anchor, ContextMenu_Item) => {
												ContextMenu_Item($$anchor, {
													class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
													children: ($$anchor, $$slotProps) => {
														var fragment_4 = root_1();
														var div_3 = $.first_child(fragment_4);
														var node_7 = $.child(div_3);

														PencilSimpleLine(node_7, { class: 'text-foreground-alt mr-2 size-5' });
														$.next();
														$.reset(div_3);
														$.next(2);
														$.append($$anchor, fragment_4);
													},
													$$slots: { default: true }
												});
											});

											var node_8 = $.sibling(node_6, 2);

											$.component(node_8, () => ContextMenu.Sub, ($$anchor, ContextMenu_Sub) => {
												ContextMenu_Sub($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_5 = root_4();
														var node_9 = $.first_child(fragment_5);

														$.component(node_9, () => ContextMenu.SubTrigger, ($$anchor, ContextMenu_SubTrigger) => {
															ContextMenu_SubTrigger($$anchor, {
																class: 'rounded-button data-highlighted:bg-muted data-[state=open]:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																children: ($$anchor, $$slotProps) => {
																	var fragment_6 = root_2();
																	var div_4 = $.first_child(fragment_6);
																	var node_10 = $.child(div_4);

																	PlusCircle(node_10, { class: 'text-foreground-alt mr-2 size-5' });
																	$.next();
																	$.reset(div_4);
																	$.next(2);
																	$.append($$anchor, fragment_6);
																},
																$$slots: { default: true }
															});
														});

														var node_11 = $.sibling(node_9, 2);

														$.component(node_11, () => ContextMenu.SubContent, ($$anchor, ContextMenu_SubContent) => {
															ContextMenu_SubContent($$anchor, {
																class: 'border-muted bg-background shadow-popover z-100 ring-0! ring-transparent! w-[209px] rounded-xl border px-1 py-1.5',
																sideOffset: 10,
																children: ($$anchor, $$slotProps) => {
																	var fragment_7 = root_3();
																	var node_12 = $.first_child(fragment_7);

																	$.component(node_12, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_1) => {
																		ContextMenu_Item_1($$anchor, {
																			class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-normal focus-visible:outline-none',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text = $.text('Header');

																				$.append($$anchor, text);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_13 = $.sibling(node_12, 2);

																	$.component(node_13, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_2) => {
																		ContextMenu_Item_2($$anchor, {
																			class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-normal focus-visible:outline-none',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_1 = $.text('Paragraph');

																				$.append($$anchor, text_1);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_14 = $.sibling(node_13, 2);

																	$.component(node_14, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_3) => {
																		ContextMenu_Item_3($$anchor, {
																			class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-normal focus-visible:outline-none',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_2 = $.text('Codeblock');

																				$.append($$anchor, text_2);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_15 = $.sibling(node_14, 2);

																	$.component(node_15, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_4) => {
																		ContextMenu_Item_4($$anchor, {
																			class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-normal focus-visible:outline-none',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_3 = $.text('List');

																				$.append($$anchor, text_3);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_16 = $.sibling(node_15, 2);

																	$.component(node_16, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_5) => {
																		ContextMenu_Item_5($$anchor, {
																			class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-normal focus-visible:outline-none',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_4 = $.text('Task');

																				$.append($$anchor, text_4);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_7);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_5);
													},
													$$slots: { default: true }
												});
											});

											var node_17 = $.sibling(node_8, 2);

											$.component(node_17, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_6) => {
												ContextMenu_Item_6($$anchor, {
													class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
													children: ($$anchor, $$slotProps) => {
														var fragment_8 = root_5();
														var div_5 = $.first_child(fragment_8);
														var node_18 = $.child(div_5);

														CopySimple(node_18, { class: 'text-foreground-alt mr-2 size-5' });
														$.next();
														$.reset(div_5);
														$.next(2);
														$.append($$anchor, fragment_8);
													},
													$$slots: { default: true }
												});
											});

											var node_19 = $.sibling(node_17, 2);

											$.component(node_19, () => ContextMenu.Separator, ($$anchor, ContextMenu_Separator) => {
												ContextMenu_Separator($$anchor, { class: 'bg-muted -mx-1 my-1 block h-px' });
											});

											var node_20 = $.sibling(node_19, 2);

											$.component(node_20, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_7) => {
												ContextMenu_Item_7($$anchor, {
													class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
													children: ($$anchor, $$slotProps) => {
														var div_6 = root_6();
														var node_21 = $.child(div_6);

														Trash(node_21, { class: 'text-foreground-alt mr-2 size-5' });
														$.next();
														$.reset(div_6);
														$.append($$anchor, div_6);
													},
													$$slots: { default: true }
												});
											});

											$.reset(div_2);
											$.reset(div_1);
											$.transition(3, div_2, () => fly, () => ({ duration: 300 }));
											$.append($$anchor, div_1);
										};

										$.if(node_5, ($$render) => {
											if (open()) $$render(consequent);
										});
									}

									$.append($$anchor, fragment_3);
								};

								$.component(node_4, () => ContextMenu.Content, ($$anchor, ContextMenu_Content) => {
									ContextMenu_Content($$anchor, {
										class: 'focus-override border-muted bg-background shadow-popover w-[229px] rounded-xl border px-1 py-1.5 focus-visible:outline-none',
										forceMount: true,
										child,
										$$slots: { child: true }
									});
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
	});

	$.append($$anchor, fragment);
}