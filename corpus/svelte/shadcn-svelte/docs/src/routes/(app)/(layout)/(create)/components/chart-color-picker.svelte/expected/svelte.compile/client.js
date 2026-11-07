import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mode } from "mode-watcher";
import { PRESET_CHART_COLORS } from "shadcn-svelte/preset";
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { BASE_THEMES, getThemesForBaseColor } from "$lib/registry/config.js";
import { IsMobile } from "$lib/registry/hooks/is-mobile.svelte.js";
import * as Picker from "./picker/index.js";
import LockButton from "./lock-button.svelte";

var root = $.from_html(`<div class="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 rounded-full bg-(--color) select-none md:right-2.5"></div>`);
var root_1 = $.from_html(`<div class="flex flex-col justify-start text-left"><div class="text-xs text-muted-foreground">Chart Color</div> <div class="text-sm font-medium text-foreground"> </div></div> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<div class="group/picker relative"><!> <!></div>`);

export default function Chart_color_picker($$anchor, $$props) {
	$.push($$props, true);

	let submenu = $.prop($$props, 'submenu', 3, false);
	const designSystem = useDesignSystem();
	const isMobile = new IsMobile();
	const availableChartColors = $.derived(() => getThemesForBaseColor(designSystem.baseColor));
	const currentChartColor = $.derived(() => $.get(availableChartColors).find((theme) => theme.name === designSystem.chartColor) ?? $.get(availableChartColors)[0]);

	$.user_effect(() => {
		if ($.get(availableChartColors).length === 0) return;

		if (!$.get(availableChartColors).some((t) => t.name === designSystem.chartColor)) {
			designSystem.chartColor = $.get(availableChartColors)[0].name;
		}
	});

	function isBaseColor(theme) {
		return BASE_THEMES.some((baseColor) => baseColor.name === theme.name);
	}

	function getSwatchColor(theme) {
		const m = mode.current ?? "light";

		if (isBaseColor(theme)) {
			return theme.cssVars[m]["muted-foreground"];
		}

		return theme.cssVars[m]["primary"];
	}

	var div = root_4();
	var node = $.child(div);

	$.component(node, () => Picker.Root, ($$anchor, Picker_Root) => {
		Picker_Root($$anchor, {
			get submenu() {
				return submenu();
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_3();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Picker.Trigger, ($$anchor, Picker_Trigger) => {
					Picker_Trigger($$anchor, {
						get submenu() {
							return submenu();
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_1();
							var div_1 = $.first_child(fragment_1);
							var div_2 = $.sibling($.child(div_1), 2);
							var text = $.only_child(div_2, true);

							$.reset(div_1);

							var node_2 = $.sibling(div_1, 2);

							{
								var consequent = ($$anchor) => {
									var div_3 = root();

									$.template_effect(($0) => $.set_style(div_3, `--color: ${$0 ?? ''};`), [
										() => $.get(currentChartColor)
											? getSwatchColor($.get(currentChartColor))
											: 'transparent'
									]);

									$.append($$anchor, div_3);
								};

								$.if(node_2, ($$render) => {
									if (mode.current) $$render(consequent);
								});
							}

							$.template_effect(() => $.set_text(text, $.get(currentChartColor)?.title));
							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_1, 2);

				{
					let $0 = $.derived(() => isMobile.current ? "top" : submenu() ? "left" : "right");
					let $1 = $.derived(() => isMobile.current ? "center" : "start");
					let $2 = $.derived(() => submenu() ? 5 : 20);

					$.component(node_3, () => Picker.Content, ($$anchor, Picker_Content) => {
						Picker_Content($$anchor, {
							get side() {
								return $.get($0);
							},

							get align() {
								return $.get($1);
							},
							class: 'max-h-92 overflow-y-auto',
							get sideOffset() {
								return $.get($2);
							},

							get submenu() {
								return submenu();
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_2 = $.comment();
								var node_4 = $.first_child(fragment_2);

								$.component(node_4, () => Picker.RadioGroup, ($$anchor, Picker_RadioGroup) => {
									Picker_RadioGroup($$anchor, {
										get value() {
											return designSystem.chartColor;
										},

										set value($$value) {
											designSystem.chartColor = $$value;
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_3 = root_2();
											var node_5 = $.first_child(fragment_3);

											$.component(node_5, () => Picker.Group, ($$anchor, Picker_Group) => {
												Picker_Group($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_4 = $.comment();
														var node_6 = $.first_child(fragment_4);

														$.each(node_6, 17, () => $.get(availableChartColors).filter((theme) => BASE_THEMES.some((baseColor) => baseColor.name === theme.name)), (theme) => theme.name, ($$anchor, theme) => {
															var fragment_5 = $.comment();
															var node_7 = $.first_child(fragment_5);

															$.component(node_7, () => Picker.RadioItem, ($$anchor, Picker_RadioItem) => {
																Picker_RadioItem($$anchor, {
																	get value() {
																		return $.get(theme).name;
																	},
																	closeOnSelect: false,
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_1 = $.text();

																		$.template_effect(() => $.set_text(text_1, $.get(theme).title));
																		$.append($$anchor, text_1);
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

											var node_8 = $.sibling(node_5, 2);

											$.component(node_8, () => Picker.Separator, ($$anchor, Picker_Separator) => {
												Picker_Separator($$anchor, {});
											});

											var node_9 = $.sibling(node_8, 2);

											$.component(node_9, () => Picker.Group, ($$anchor, Picker_Group_1) => {
												Picker_Group_1($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_7 = $.comment();
														var node_10 = $.first_child(fragment_7);

														$.each(node_10, 17, () => $.get(availableChartColors).filter((theme) => !BASE_THEMES.some((baseColor) => baseColor.name === theme.name)), (theme) => theme.name, ($$anchor, theme) => {
															var fragment_8 = $.comment();
															var node_11 = $.first_child(fragment_8);

															$.component(node_11, () => Picker.RadioItem, ($$anchor, Picker_RadioItem_1) => {
																Picker_RadioItem_1($$anchor, {
																	get value() {
																		return $.get(theme).name;
																	},
																	closeOnSelect: false,
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text();

																		$.template_effect(() => $.set_text(text_2, $.get(theme).title));
																		$.append($$anchor, text_2);
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

	var node_12 = $.sibling(node, 2);

	LockButton(node_12, {
		prop: 'chartColor',
		class: 'absolute top-1/2 right-10 -translate-y-1/2'
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}