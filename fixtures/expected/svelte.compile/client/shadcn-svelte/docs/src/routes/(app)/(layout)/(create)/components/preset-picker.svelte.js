import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { PRESETS, STYLES } from "$lib/registry/config.js";
import { IsMobile } from "$lib/registry/hooks/is-mobile.svelte.js";
import * as Picker from "./picker/index.js";

var root = $.from_html(`<div class="flex flex-col justify-start text-left"><div class="text-xs text-muted-foreground">Preset</div> <div class="line-clamp-1 text-sm font-medium text-foreground"> </div></div>`);
var root_1 = $.from_html(`<div class="flex size-4 shrink-0 items-center justify-center"><!></div>`);
var root_2 = $.from_html(`<div class="flex items-center gap-2"><!> </div>`);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Preset_picker($$anchor, $$props) {
	$.push($$props, true);

	let submenu = $.prop($$props, 'submenu', 3, false);
	const designSystem = useDesignSystem();
	const currentPreset = $.derived(() => PRESETS.find((preset) => preset.baseColor === designSystem.baseColor && preset.style === designSystem.style && preset.theme === designSystem.theme && preset.iconLibrary === designSystem.iconLibrary && preset.font === designSystem.font && preset.menuAccent === designSystem.menuAccent && preset.menuColor === designSystem.menuColor && preset.radius === designSystem.radius));
	const selectedPresetTitle = $.derived(() => $.get(currentPreset)?.title ?? "");

	function handlePresetChange(value) {
		const preset = PRESETS.find((p) => p.title === value);

		if (!preset) {
			return;
		}

		// Update all params including baseColor.
		designSystem.baseColor = preset.baseColor;

		designSystem.style = preset.style;
		designSystem.theme = preset.theme;
		designSystem.iconLibrary = preset.iconLibrary;
		designSystem.font = preset.font;
		designSystem.menuAccent = preset.menuAccent;
		designSystem.menuColor = preset.menuColor;
		designSystem.radius = preset.radius;
	}

	const isMobile = new IsMobile();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Picker.Root, ($$anchor, Picker_Root) => {
		Picker_Root($$anchor, {
			get submenu() {
				return submenu();
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_3();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Picker.Trigger, ($$anchor, Picker_Trigger) => {
					Picker_Trigger($$anchor, {
						get submenu() {
							return submenu();
						},

						children: ($$anchor, $$slotProps) => {
							var div = root();
							var div_1 = $.sibling($.child(div), 2);
							var text = $.only_child(div_1, true);

							$.reset(div);
							$.template_effect(() => $.set_text(text, $.get(currentPreset)?.description ?? "Custom"));
							$.append($$anchor, div);
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
							class: 'md:w-72',
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
											return $.get(selectedPresetTitle);
										},
										onValueChange: handlePresetChange,
										children: ($$anchor, $$slotProps) => {
											var fragment_3 = $.comment();
											var node_4 = $.first_child(fragment_3);

											$.component(node_4, () => Picker.Group, ($$anchor, Picker_Group) => {
												Picker_Group($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_4 = $.comment();
														var node_5 = $.first_child(fragment_4);

														$.each(node_5, 17, () => PRESETS, (preset) => preset.title, ($$anchor, preset) => {
															const style = $.derived(() => STYLES.find((s) => s.name === $.get(preset).style));
															var fragment_5 = $.comment();
															var node_6 = $.first_child(fragment_5);

															$.component(node_6, () => Picker.RadioItem, ($$anchor, Picker_RadioItem) => {
																Picker_RadioItem($$anchor, {
																	get value() {
																		return $.get(preset).title;
																	},
																	closeOnSelect: false,
																	children: ($$anchor, $$slotProps) => {
																		var div_2 = root_2();
																		var node_7 = $.child(div_2);

																		{
																			var consequent = ($$anchor) => {
																				var div_3 = root_1();
																				var node_8 = $.child(div_3);

																				$.component(node_8, () => $.get(style).icon, ($$anchor, style_icon) => {
																					style_icon($$anchor, { class: 'size-4' });
																				});

																				$.reset(div_3);
																				$.append($$anchor, div_3);
																			};

																			$.if(node_7, ($$render) => {
																				if ($.get(style)?.icon) $$render(consequent);
																			});
																		}

																		var text_1 = $.sibling(node_7);

																		$.reset(div_2);
																		$.template_effect(() => $.set_text(text_1, ` ${$.get(preset).description ?? ''}`));
																		$.append($$anchor, div_2);
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

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}