import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tooltip, Toolbar, Separator } from "bits-ui";
import TextB from "phosphor-svelte/lib/TextB";
import TextItalic from "phosphor-svelte/lib/TextItalic";
import TextStrikethrough from "phosphor-svelte/lib/TextStrikethrough";
import TextAlignLeft from "phosphor-svelte/lib/TextAlignLeft";
import TextAlignCenter from "phosphor-svelte/lib/TextAlignCenter";
import TextAlignRight from "phosphor-svelte/lib/TextAlignRight";
import Sparkle from "phosphor-svelte/lib/Sparkle";

const tooltipContent = ($$anchor, $$arg0) => {
	let content = () => ($$arg0?.()).content;
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
		Tooltip_Content($$anchor, {
			class: 'rounded-input border-dark-10 bg-background shadow-popover outline-hidden animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--bits-tooltip-content-transform-origin) z-0 flex items-center justify-center border p-3 text-sm font-medium',
			sideOffset: 8,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text();

				$.template_effect(() => $.set_text(text_1, content()));
				$.append($$anchor, text_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
};

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <span>Ask AI</span>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <div class="flex items-center"><!></div>`, 1);

export default function Tooltip_demo_group($$anchor) {
	let text = $.state($.proxy([]));
	let align = $.state("center");
	var fragment_2 = $.comment();
	var node_1 = $.first_child(fragment_2);

	$.component(node_1, () => Tooltip.Provider, ($$anchor, Tooltip_Provider) => {
		Tooltip_Provider($$anchor, {
			delayDuration: 200,
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = $.comment();
				var node_2 = $.first_child(fragment_3);

				$.component(node_2, () => Toolbar.Root, ($$anchor, Toolbar_Root) => {
					Toolbar_Root($$anchor, {
						class: 'rounded-10px border-border bg-background-alt shadow-mini flex h-12 min-w-max items-center justify-center border px-[4px] py-1',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_3();
							var node_3 = $.first_child(fragment_4);

							$.component(node_3, () => Toolbar.Group, ($$anchor, Toolbar_Group) => {
								Toolbar_Group($$anchor, {
									type: 'multiple',
									class: 'flex items-center gap-x-0.5',
									get value() {
										return $.get(text);
									},

									set value($$value) {
										$.set(text, $$value, true);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root_1();
										var node_4 = $.first_child(fragment_5);

										$.component(node_4, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
											Tooltip_Root($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root();
													var node_5 = $.first_child(fragment_6);

													{
														const child = ($$anchor, $$arg0) => {
															let props = () => ($$arg0?.()).props;

															const computed_const = $.derived(() => {
																const { "data-state": _state, ...rest } = props();

																return { _state, rest };
															});

															var fragment_7 = $.comment();
															var node_6 = $.first_child(fragment_7);

															$.component(node_6, () => Toolbar.GroupItem, ($$anchor, Toolbar_GroupItem) => {
																Toolbar_GroupItem($$anchor, $.spread_props(
																	{
																		'aria-label': 'toggle bold',
																		value: 'bold',
																		class: 'rounded-9px bg-background-alt text-foreground/60 hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=on]:text-foreground/80 active:data-[state=on]:bg-dark-10 inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]'
																	},
																	() => $.get(computed_const).rest,
																	{
																		children: ($$anchor, $$slotProps) => {
																			TextB($$anchor, { class: 'size-6' });
																		},
																		$$slots: { default: true }
																	}
																));
															});

															$.append($$anchor, fragment_7);
														};

														$.component(node_5, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
															Tooltip_Trigger($$anchor, { child, $$slots: { child: true } });
														});
													}

													var node_7 = $.sibling(node_5, 2);

													tooltipContent(node_7, () => ({ content: "Bold" }));
													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											});
										});

										var node_8 = $.sibling(node_4, 2);

										$.component(node_8, () => Tooltip.Root, ($$anchor, Tooltip_Root_1) => {
											Tooltip_Root_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_9 = root();
													var node_9 = $.first_child(fragment_9);

													{
														const child = ($$anchor, $$arg0) => {
															let props = () => ($$arg0?.()).props;

															const computed_const_1 = $.derived(() => {
																const { "data-state": _state, ...rest } = props();

																return { _state, rest };
															});

															var fragment_10 = $.comment();
															var node_10 = $.first_child(fragment_10);

															$.component(node_10, () => Toolbar.GroupItem, ($$anchor, Toolbar_GroupItem_1) => {
																Toolbar_GroupItem_1($$anchor, $.spread_props(
																	{
																		'aria-label': 'toggle italic',
																		value: 'italic',
																		class: 'rounded-9px bg-background-alt text-foreground/60 hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=on]:text-foreground/80 active:data-[state=on]:bg-dark-10 inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]'
																	},
																	() => $.get(computed_const_1).rest,
																	{
																		children: ($$anchor, $$slotProps) => {
																			TextItalic($$anchor, { class: 'size-6' });
																		},
																		$$slots: { default: true }
																	}
																));
															});

															$.append($$anchor, fragment_10);
														};

														$.component(node_9, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_1) => {
															Tooltip_Trigger_1($$anchor, { child, $$slots: { child: true } });
														});
													}

													var node_11 = $.sibling(node_9, 2);

													tooltipContent(node_11, () => ({ content: "Italic" }));
													$.append($$anchor, fragment_9);
												},
												$$slots: { default: true }
											});
										});

										var node_12 = $.sibling(node_8, 2);

										$.component(node_12, () => Tooltip.Root, ($$anchor, Tooltip_Root_2) => {
											Tooltip_Root_2($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_12 = root();
													var node_13 = $.first_child(fragment_12);

													{
														const child = ($$anchor, $$arg0) => {
															let props = () => ($$arg0?.()).props;

															const computed_const_2 = $.derived(() => {
																const { "data-state": _state, ...rest } = props();

																return { _state, rest };
															});

															var fragment_13 = $.comment();
															var node_14 = $.first_child(fragment_13);

															$.component(node_14, () => Toolbar.GroupItem, ($$anchor, Toolbar_GroupItem_2) => {
																Toolbar_GroupItem_2($$anchor, $.spread_props(
																	{
																		'aria-label': 'toggle strikethrough',
																		value: 'strikethrough',
																		class: 'rounded-9px bg-background-alt text-foreground/60 hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=on]:text-foreground/80 active:data-[state=on]:bg-dark-10 inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]'
																	},
																	() => $.get(computed_const_2).rest,
																	{
																		children: ($$anchor, $$slotProps) => {
																			TextStrikethrough($$anchor, { class: 'size-6' });
																		},
																		$$slots: { default: true }
																	}
																));
															});

															$.append($$anchor, fragment_13);
														};

														$.component(node_13, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_2) => {
															Tooltip_Trigger_2($$anchor, { child, $$slots: { child: true } });
														});
													}

													var node_15 = $.sibling(node_13, 2);

													tooltipContent(node_15, () => ({ content: "Strikethrough" }));
													$.append($$anchor, fragment_12);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							var node_16 = $.sibling(node_3, 2);

							$.component(node_16, () => Separator.Root, ($$anchor, Separator_Root) => {
								Separator_Root($$anchor, { class: 'bg-dark-10 -my-1 mx-1 w-[1px] self-stretch' });
							});

							var node_17 = $.sibling(node_16, 2);

							$.component(node_17, () => Toolbar.Group, ($$anchor, Toolbar_Group_1) => {
								Toolbar_Group_1($$anchor, {
									type: 'single',
									class: 'flex items-center gap-x-0.5',
									get value() {
										return $.get(align);
									},

									set value($$value) {
										$.set(align, $$value, true);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_15 = root_1();
										var node_18 = $.first_child(fragment_15);

										$.component(node_18, () => Toolbar.GroupItem, ($$anchor, Toolbar_GroupItem_3) => {
											Toolbar_GroupItem_3($$anchor, {
												'aria-label': 'align left',
												value: 'left',
												class: 'rounded-9px bg-background-alt text-foreground/60 hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=on]:text-foreground/80 active:data-[state=on]:bg-dark-10 inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]',
												children: ($$anchor, $$slotProps) => {
													TextAlignLeft($$anchor, { class: 'size-6' });
												},
												$$slots: { default: true }
											});
										});

										var node_19 = $.sibling(node_18, 2);

										$.component(node_19, () => Toolbar.GroupItem, ($$anchor, Toolbar_GroupItem_4) => {
											Toolbar_GroupItem_4($$anchor, {
												'aria-label': 'align center',
												value: 'center',
												class: 'rounded-9px bg-background-alt text-foreground/60 hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=on]:text-foreground/80 active:data-[state=on]:bg-dark-10 inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]',
												children: ($$anchor, $$slotProps) => {
													TextAlignCenter($$anchor, { class: 'size-6' });
												},
												$$slots: { default: true }
											});
										});

										var node_20 = $.sibling(node_19, 2);

										$.component(node_20, () => Toolbar.GroupItem, ($$anchor, Toolbar_GroupItem_5) => {
											Toolbar_GroupItem_5($$anchor, {
												'aria-label': 'align right',
												value: 'right',
												class: 'rounded-9px bg-background-alt text-foreground/60 hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=on]:text-foreground/80 active:data-[state=on]:bg-dark-10 inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]',
												children: ($$anchor, $$slotProps) => {
													TextAlignRight($$anchor, { class: 'size-6' });
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_15);
									},
									$$slots: { default: true }
								});
							});

							var node_21 = $.sibling(node_17, 2);

							$.component(node_21, () => Separator.Root, ($$anchor, Separator_Root_1) => {
								Separator_Root_1($$anchor, { class: 'bg-dark-10 -my-1 mx-1 w-[1px] self-stretch' });
							});

							var div = $.sibling(node_21, 2);
							var node_22 = $.child(div);

							$.component(node_22, () => Toolbar.Button, ($$anchor, Toolbar_Button) => {
								Toolbar_Button($$anchor, {
									class: 'rounded-9px text-foreground/80 hover:bg-muted active:bg-dark-10 inline-flex items-center justify-center  px-3 py-2 text-sm font-medium transition-all active:scale-[0.98]',
									children: ($$anchor, $$slotProps) => {
										var fragment_19 = root_2();
										var node_23 = $.first_child(fragment_19);

										Sparkle(node_23, { class: 'mr-2 size-6' });
										$.next(2);
										$.append($$anchor, fragment_19);
									},
									$$slots: { default: true }
								});
							});

							$.reset(div);
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

	$.append($$anchor, fragment_2);
}