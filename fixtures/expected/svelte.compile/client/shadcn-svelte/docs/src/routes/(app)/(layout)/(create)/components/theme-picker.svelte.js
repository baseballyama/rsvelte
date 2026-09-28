import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mode } from "mode-watcher";
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { BASE_THEMES, THEMES } from "$lib/registry/config.js";
import { IsMobile } from "$lib/registry/hooks/is-mobile.svelte.js";
import * as Picker from "./picker/index.js";
import LockButton from "./lock-button.svelte";

var root = $.from_html(`<div class="flex flex-col justify-start text-left"><div class="text-xs text-muted-foreground">Theme</div> <div class="text-sm font-medium text-foreground"> </div></div> <div class="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 rounded-full bg-(--color) select-none"></div>`, 1);
var root_1 = $.from_html(`<div class="size-4 translate-y-1 rounded-full bg-(--color)"></div>`);
var root_2 = $.from_html(`<div class="flex items-start gap-2"><!> <div class="flex flex-col justify-start pointer-coarse:gap-1"><div> </div> <div class="text-xs text-muted-foreground pointer-coarse:text-sm">Match base color</div></div></div>`);
var root_3 = $.from_html(`<div class="size-4 rounded-full bg-(--color)"></div>`);
var root_4 = $.from_html(`<div class="flex items-center gap-2"><!> </div>`);
var root_5 = $.from_html(`<!> <!> <!>`, 1);
var root_6 = $.from_html(`<!> <!>`, 1);
var root_7 = $.from_html(`<div class="group/picker relative"><!> <!></div>`);

export default function Theme_picker($$anchor, $$props) {
	$.push($$props, true);

	let submenu = $.prop($$props, 'submenu', 3, false);
	const designSystem = useDesignSystem();
	const isMobile = new IsMobile();
	const currentTheme = $.derived(() => THEMES.find((theme) => theme.name === designSystem.theme) ?? THEMES[0]);

	function isBaseColor(theme) {
		return BASE_THEMES.find((baseColor) => baseColor.name === theme.name) !== undefined;
	}

	function getColorForTheme(theme) {
		if (isBaseColor(theme)) {
			return theme.cssVars[mode.current ?? "light"]["muted-foreground"];
		}

		return theme.cssVars[mode.current ?? "light"]["primary"];
	}

	var div = root_7();
	var node = $.child(div);

	$.component(node, () => Picker.Root, ($$anchor, Picker_Root) => {
		Picker_Root($$anchor, {
			get submenu() {
				return submenu();
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_6();
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

							$.template_effect(
								($0) => {
									$.set_text(text, $.get(currentTheme)?.title);
									$.set_style(div_3, `--color: ${$0 ?? ''};`);
								},
								[() => getColorForTheme($.get(currentTheme))]
							);

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
							class: 'max-h-96 overflow-y-auto',
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
										get value() {
											return designSystem.theme;
										},

										set value($$value) {
											designSystem.theme = $$value;
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_3 = root_5();
											var node_4 = $.first_child(fragment_3);

											$.component(node_4, () => Picker.Group, ($$anchor, Picker_Group) => {
												Picker_Group($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_4 = $.comment();
														var node_5 = $.first_child(fragment_4);

														$.each(node_5, 17, () => THEMES.filter((theme) => BASE_THEMES.find((baseColor) => baseColor.name === theme.name)), (theme) => theme.name, ($$anchor, theme) => {
															var fragment_5 = $.comment();
															var node_6 = $.first_child(fragment_5);

															{
																var consequent_1 = ($$anchor) => {
																	var fragment_6 = $.comment();
																	var node_7 = $.first_child(fragment_6);

																	$.component(node_7, () => Picker.RadioItem, ($$anchor, Picker_RadioItem) => {
																		Picker_RadioItem($$anchor, {
																			get value() {
																				return $.get(theme).name;
																			},
																			closeOnSelect: false,
																			children: ($$anchor, $$slotProps) => {
																				var div_4 = root_2();
																				var node_8 = $.child(div_4);

																				{
																					var consequent = ($$anchor) => {
																						var div_5 = root_1();

																						$.template_effect(($0) => $.set_style(div_5, `--color: ${$0 ?? ''};`), [() => getColorForTheme($.get(theme))]);
																						$.append($$anchor, div_5);
																					};

																					$.if(node_8, ($$render) => {
																						if (mode.current) $$render(consequent);
																					});
																				}

																				var div_6 = $.sibling(node_8, 2);
																				var div_7 = $.child(div_6);
																				var text_1 = $.only_child(div_7, true);

																				$.next(2);
																				$.reset(div_6);
																				$.reset(div_4);
																				$.template_effect(() => $.set_text(text_1, $.get(theme).title));
																				$.append($$anchor, div_4);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_6);
																};

																$.if(node_6, ($$render) => {
																	if ($.get(theme).name === designSystem.baseColor) $$render(consequent_1);
																});
															}

															$.append($$anchor, fragment_5);
														});

														$.append($$anchor, fragment_4);
													},
													$$slots: { default: true }
												});
											});

											var node_9 = $.sibling(node_4, 2);

											$.component(node_9, () => Picker.Separator, ($$anchor, Picker_Separator) => {
												Picker_Separator($$anchor, {});
											});

											var node_10 = $.sibling(node_9, 2);

											$.component(node_10, () => Picker.Group, ($$anchor, Picker_Group_1) => {
												Picker_Group_1($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_7 = $.comment();
														var node_11 = $.first_child(fragment_7);

														$.each(node_11, 17, () => THEMES.filter((theme) => !BASE_THEMES.find((baseColor) => baseColor.name === theme.name)), (theme) => theme.name, ($$anchor, theme) => {
															var fragment_8 = $.comment();
															var node_12 = $.first_child(fragment_8);

															$.component(node_12, () => Picker.RadioItem, ($$anchor, Picker_RadioItem_1) => {
																Picker_RadioItem_1($$anchor, {
																	get value() {
																		return $.get(theme).name;
																	},
																	closeOnSelect: false,
																	children: ($$anchor, $$slotProps) => {
																		var div_8 = root_4();
																		var node_13 = $.child(div_8);

																		{
																			var consequent_2 = ($$anchor) => {
																				var div_9 = root_3();

																				$.template_effect(() => $.set_style(div_9, `--color: ${$.get(theme).cssVars[mode.current]['primary'] ?? ''};`));
																				$.append($$anchor, div_9);
																			};

																			$.if(node_13, ($$render) => {
																				if (mode.current) $$render(consequent_2);
																			});
																		}

																		var text_2 = $.sibling(node_13);

																		$.reset(div_8);
																		$.template_effect(() => $.set_text(text_2, ` ${$.get(theme).title ?? ''}`));
																		$.append($$anchor, div_8);
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

	var node_14 = $.sibling(node, 2);

	LockButton(node_14, {
		prop: 'theme',
		class: 'absolute top-1/2 right-10 -translate-y-1/2'
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}