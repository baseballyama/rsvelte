import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mode, setMode } from "mode-watcher";
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { BASE_THEMES } from "$lib/registry/config.js";
import { IsMobile } from "$lib/registry/hooks/is-mobile.svelte.js";
import * as Picker from "./picker/index.js";
import LockButton from "./lock-button.svelte";

var root = $.from_html(`<div class="flex flex-col justify-start text-left"><div class="text-xs text-muted-foreground">Base Color</div> <div class="text-sm font-medium text-foreground"> </div></div> <div class="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 rounded-full bg-(--color) select-none"></div>`, 1);
var root_1 = $.from_html(`<div class="size-4 rounded-full bg-(--color)"></div>`);
var root_2 = $.from_html(`<div class="flex items-center gap-2"><!> </div>`);
var root_3 = $.from_html(`<div class="flex flex-col justify-start pointer-coarse:gap-1"><div> </div> <div class="text-xs text-muted-foreground pointer-coarse:text-sm">Base colors are easier to see in dark mode.</div></div>`);
var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<!> <!>`, 1);
var root_6 = $.from_html(`<div class="group/picker relative"><!> <!></div>`);

export default function Base_color_picker($$anchor, $$props) {
	$.push($$props, true);

	let submenu = $.prop($$props, 'submenu', 3, false);
	const designSystem = useDesignSystem();
	const isMobile = new IsMobile();
	const currentBaseColor = $.derived(() => BASE_THEMES.find((base) => base.name === designSystem.baseColor) ?? BASE_THEMES[0]);
	var div = root_6();
	var node = $.child(div);

	$.component(node, () => Picker.Root, ($$anchor, Picker_Root) => {
		Picker_Root($$anchor, {
			get submenu() {
				return submenu();
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_5();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Picker.Trigger, ($$anchor, Picker_Trigger) => {
					Picker_Trigger($$anchor, {
						get submenu() {
							return submenu();
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var div_1 = $.first_child(fragment_1);
							var div_2 = $.sibling($.child(div_1), 2);
							var text = $.only_child(div_2, true);

							$.reset(div_1);

							var div_3 = $.sibling(div_1, 2);

							$.template_effect(() => {
								$.set_text(text, $.get(currentBaseColor)?.title);

								$.set_style(div_3, `--color: 
						${$.get(currentBaseColor)?.cssVars?.[mode.current]?.['muted-foreground'] ?? ''}`);
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				{
					let $0 = $.derived(() => isMobile.current ? "top" : submenu() ? "left" : "right");
					let $1 = $.derived(() => isMobile.current ? "center" : "start");
					let $2 = $.derived(() => submenu() ? 5 : 20);

					$.component(node_2, () => Picker.Content, ($$anchor, Picker_Content) => {
						Picker_Content($$anchor, {
							get side() {
								return $.get($0);
							},

							get align() {
								return $.get($1);
							},

							get sideOffset() {
								return $.get($2);
							},

							get submenu() {
								return submenu();
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_2 = $.comment();
								var node_3 = $.first_child(fragment_2);

								$.component(node_3, () => Picker.RadioGroup, ($$anchor, Picker_RadioGroup) => {
									Picker_RadioGroup($$anchor, {
										onValueChange: (value) => {
											if (value === "dark") {
												setMode(mode.current === "dark" ? "light" : "dark");

												return;
											}

											designSystem.baseColor = value;
										},

										get value() {
											return designSystem.baseColor;
										},

										set value($$value) {
											designSystem.baseColor = $$value;
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_3 = root_4();
											var node_4 = $.first_child(fragment_3);

											$.component(node_4, () => Picker.Group, ($$anchor, Picker_Group) => {
												Picker_Group($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_4 = $.comment();
														var node_5 = $.first_child(fragment_4);

														$.each(node_5, 17, () => BASE_THEMES, (baseColor) => baseColor.name, ($$anchor, baseColor) => {
															var fragment_5 = $.comment();
															var node_6 = $.first_child(fragment_5);

															$.component(node_6, () => Picker.RadioItem, ($$anchor, Picker_RadioItem) => {
																Picker_RadioItem($$anchor, {
																	get value() {
																		return $.get(baseColor).name;
																	},
																	closeOnSelect: false,
																	children: ($$anchor, $$slotProps) => {
																		var div_4 = root_2();
																		var node_7 = $.child(div_4);

																		{
																			var consequent = ($$anchor) => {
																				var div_5 = root_1();

																				$.template_effect(() => $.set_style(div_5, `--color: ${$.get(baseColor).cssVars?.[mode.current]?.['muted-foreground'] ?? ''};`));
																				$.append($$anchor, div_5);
																			};

																			$.if(node_7, ($$render) => {
																				if (mode.current) $$render(consequent);
																			});
																		}

																		var text_1 = $.sibling(node_7);

																		$.reset(div_4);
																		$.template_effect(() => $.set_text(text_1, ` ${$.get(baseColor).title ?? ''}`));
																		$.append($$anchor, div_4);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_5);
														});

														$.append($$anchor, fragment_4);
													},
													$$slots: { default: true }
												});
											});

											var node_8 = $.sibling(node_4, 2);

											$.component(node_8, () => Picker.Separator, ($$anchor, Picker_Separator) => {
												Picker_Separator($$anchor, {});
											});

											var node_9 = $.sibling(node_8, 2);

											$.component(node_9, () => Picker.Group, ($$anchor, Picker_Group_1) => {
												Picker_Group_1($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_6 = $.comment();
														var node_10 = $.first_child(fragment_6);

														$.component(node_10, () => Picker.Item, ($$anchor, Picker_Item) => {
															Picker_Item($$anchor, {
																closeOnSelect: false,
																onclick: () => {
																	setMode(mode.current === "dark" ? "light" : "dark");
																},

																children: ($$anchor, $$slotProps) => {
																	var div_6 = root_3();
																	var div_7 = $.child(div_6);
																	var text_2 = $.only_child(div_7);

																	$.next(2);
																	$.reset(div_6);
																	$.template_effect(() => $.set_text(text_2, `Switch to ${mode.current === "dark" ? "Light" : "Dark"} Mode`));
																	$.append($$anchor, div_6);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_6);
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
							},
							$$slots: { default: true }
						});
					});
				}

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_11 = $.sibling(node, 2);

	LockButton(node_11, {
		prop: 'baseColor',
		class: 'absolute top-1/2 right-10 -translate-y-1/2'
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}