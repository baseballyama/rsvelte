import * as $ from 'svelte/internal/server';
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { PRESETS, STYLES } from "$lib/registry/config.js";
import { IsMobile } from "$lib/registry/hooks/is-mobile.svelte.js";
import * as Picker from "./picker/index.js";

export default function Preset_picker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { submenu = false } = $$props;
		const designSystem = useDesignSystem();
		const currentPreset = $.derived(() => PRESETS.find((preset) => preset.baseColor === designSystem.baseColor && preset.style === designSystem.style && preset.theme === designSystem.theme && preset.iconLibrary === designSystem.iconLibrary && preset.font === designSystem.font && preset.menuAccent === designSystem.menuAccent && preset.menuColor === designSystem.menuColor && preset.radius === designSystem.radius));
		const selectedPresetTitle = $.derived(() => currentPreset()?.title ?? "");

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

		if (Picker.Root) {
			$$renderer.push('<!--[-->');

			Picker.Root($$renderer, {
				submenu,
				children: ($$renderer) => {
					if (Picker.Trigger) {
						$$renderer.push('<!--[-->');

						Picker.Trigger($$renderer, {
							submenu,
							children: ($$renderer) => {
								$$renderer.push(`<div class="flex flex-col justify-start text-left"><div class="text-xs text-muted-foreground">Preset</div> <div class="line-clamp-1 text-sm font-medium text-foreground">${$.escape(currentPreset()?.description ?? "Custom")}</div></div>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Picker.Content) {
						$$renderer.push('<!--[-->');

						Picker.Content($$renderer, {
							side: isMobile.current ? "top" : submenu ? "left" : "right",
							align: isMobile.current ? "center" : "start",
							class: 'md:w-72',
							sideOffset: submenu ? 5 : 20,
							submenu,
							children: ($$renderer) => {
								if (Picker.RadioGroup) {
									$$renderer.push('<!--[-->');

									Picker.RadioGroup($$renderer, {
										value: selectedPresetTitle(),
										onValueChange: handlePresetChange,
										children: ($$renderer) => {
											if (Picker.Group) {
												$$renderer.push('<!--[-->');

												Picker.Group($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!--[-->`);

														const each_array = $.ensure_array_like(PRESETS);

														for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
															let preset = each_array[$$index];
															const style = STYLES.find((s) => s.name === preset.style);

															if (Picker.RadioItem) {
																$$renderer.push('<!--[-->');

																Picker.RadioItem($$renderer, {
																	value: preset.title,
																	closeOnSelect: false,
																	children: ($$renderer) => {
																		$$renderer.push(`<div class="flex items-center gap-2">`);

																		if (style?.icon) {
																			$$renderer.push(`<!--[0--><div class="flex size-4 shrink-0 items-center justify-center">`);

																			if (style.icon) {
																				$$renderer.push('<!--[-->');
																				style.icon($$renderer, { class: 'size-4' });
																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(`</div>`);
																		} else {
																			$$renderer.push('<!--[-1-->');
																		}

																		$$renderer.push(`<!--]--> ${$.escape(preset.description)}</div>`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}
														}

														$$renderer.push(`<!--]-->`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}