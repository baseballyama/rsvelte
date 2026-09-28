import * as $ from 'svelte/internal/server';
import { mode } from "mode-watcher";
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { BASE_THEMES, THEMES } from "$lib/registry/config.js";
import { IsMobile } from "$lib/registry/hooks/is-mobile.svelte.js";
import * as Picker from "./picker/index.js";
import LockButton from "./lock-button.svelte";

export default function Theme_picker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { submenu = false } = $$props;
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="group/picker relative">`);

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
									$$renderer.push(`<div class="flex flex-col justify-start text-left"><div class="text-xs text-muted-foreground">Theme</div> <div class="text-sm font-medium text-foreground">${$.escape(currentTheme()?.title)}</div></div> <div${$.attr_style(`--color: ${$.stringify(getColorForTheme(currentTheme()))};`)} class="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 rounded-full bg-(--color) select-none"></div>`);
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
								class: 'max-h-96 overflow-y-auto',
								sideOffset: submenu ? 5 : 20,
								submenu,
								children: ($$renderer) => {
									if (Picker.RadioGroup) {
										$$renderer.push('<!--[-->');

										Picker.RadioGroup($$renderer, {
											get value() {
												return designSystem.theme;
											},

											set value($$value) {
												designSystem.theme = $$value;
												$$settled = false;
											},

											children: ($$renderer) => {
												if (Picker.Group) {
													$$renderer.push('<!--[-->');

													Picker.Group($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!--[-->`);

															const each_array = $.ensure_array_like(THEMES.filter((theme) => BASE_THEMES.find((baseColor) => baseColor.name === theme.name)));

															for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																let theme = each_array[$$index];

																if (theme.name === designSystem.baseColor) {
																	$$renderer.push('<!--[0-->');

																	if (Picker.RadioItem) {
																		$$renderer.push('<!--[-->');

																		Picker.RadioItem($$renderer, {
																			value: theme.name,
																			closeOnSelect: false,
																			children: ($$renderer) => {
																				$$renderer.push(`<div class="flex items-start gap-2">`);

																				if (mode.current) {
																					$$renderer.push(`<!--[0--><div${$.attr_style(`--color: ${$.stringify(getColorForTheme(theme))};`)} class="size-4 translate-y-1 rounded-full bg-(--color)"></div>`);
																				} else {
																					$$renderer.push('<!--[-1-->');
																				}

																				$$renderer.push(`<!--]--> <div class="flex flex-col justify-start pointer-coarse:gap-1"><div>${$.escape(theme.title)}</div> <div class="text-xs text-muted-foreground pointer-coarse:text-sm">Match base color</div></div></div>`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}
																} else {
																	$$renderer.push('<!--[-1-->');
																}

																$$renderer.push(`<!--]-->`);
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

												$$renderer.push(` `);

												if (Picker.Separator) {
													$$renderer.push('<!--[-->');
													Picker.Separator($$renderer, {});
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Picker.Group) {
													$$renderer.push('<!--[-->');

													Picker.Group($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!--[-->`);

															const each_array_1 = $.ensure_array_like(THEMES.filter((theme) => !BASE_THEMES.find((baseColor) => baseColor.name === theme.name)));

															for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
																let theme = each_array_1[$$index_1];

																if (Picker.RadioItem) {
																	$$renderer.push('<!--[-->');

																	Picker.RadioItem($$renderer, {
																		value: theme.name,
																		closeOnSelect: false,
																		children: ($$renderer) => {
																			$$renderer.push(`<div class="flex items-center gap-2">`);

																			if (mode.current) {
																				$$renderer.push(`<!--[0--><div${$.attr_style(`--color: ${$.stringify(theme.cssVars[mode.current]['primary'])};`)} class="size-4 rounded-full bg-(--color)"></div>`);
																			} else {
																				$$renderer.push('<!--[-1-->');
																			}

																			$$renderer.push(`<!--]--> ${$.escape(theme.title)}</div>`);
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

			$$renderer.push(` `);

			LockButton($$renderer, {
				prop: 'theme',
				class: 'absolute top-1/2 right-10 -translate-y-1/2'
			});

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}