import * as $ from 'svelte/internal/server';
import { mode } from "mode-watcher";
import { PRESET_CHART_COLORS } from "shadcn-svelte/preset";
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { BASE_THEMES, getThemesForBaseColor } from "$lib/registry/config.js";
import { IsMobile } from "$lib/registry/hooks/is-mobile.svelte.js";
import * as Picker from "./picker/index.js";
import LockButton from "./lock-button.svelte";

export default function Chart_color_picker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { submenu = false } = $$props;
		const designSystem = useDesignSystem();
		const isMobile = new IsMobile();
		const availableChartColors = $.derived(() => getThemesForBaseColor(designSystem.baseColor));
		const currentChartColor = $.derived(() => availableChartColors().find((theme) => theme.name === designSystem.chartColor) ?? availableChartColors()[0]);

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
									$$renderer.push(`<div class="flex flex-col justify-start text-left"><div class="text-xs text-muted-foreground">Chart Color</div> <div class="text-sm font-medium text-foreground">${$.escape(currentChartColor()?.title)}</div></div> `);

									if (mode.current) {
										$$renderer.push(`<!--[0--><div${$.attr_style(`--color: ${$.stringify(currentChartColor() ? getSwatchColor(currentChartColor()) : 'transparent')};`)} class="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 rounded-full bg-(--color) select-none md:right-2.5"></div>`);
									} else {
										$$renderer.push('<!--[-1-->');
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

						if (Picker.Content) {
							$$renderer.push('<!--[-->');

							Picker.Content($$renderer, {
								side: isMobile.current ? "top" : submenu ? "left" : "right",
								align: isMobile.current ? "center" : "start",
								class: 'max-h-92 overflow-y-auto',
								sideOffset: submenu ? 5 : 20,
								submenu,
								children: ($$renderer) => {
									if (Picker.RadioGroup) {
										$$renderer.push('<!--[-->');

										Picker.RadioGroup($$renderer, {
											get value() {
												return designSystem.chartColor;
											},

											set value($$value) {
												designSystem.chartColor = $$value;
												$$settled = false;
											},

											children: ($$renderer) => {
												if (Picker.Group) {
													$$renderer.push('<!--[-->');

													Picker.Group($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!--[-->`);

															const each_array = $.ensure_array_like(availableChartColors().filter((theme) => BASE_THEMES.some((baseColor) => baseColor.name === theme.name)));

															for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																let theme = each_array[$$index];

																if (Picker.RadioItem) {
																	$$renderer.push('<!--[-->');

																	Picker.RadioItem($$renderer, {
																		value: theme.name,
																		closeOnSelect: false,
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->${$.escape(theme.title)}`);
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

															const each_array_1 = $.ensure_array_like(availableChartColors().filter((theme) => !BASE_THEMES.some((baseColor) => baseColor.name === theme.name)));

															for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
																let theme = each_array_1[$$index_1];

																if (Picker.RadioItem) {
																	$$renderer.push('<!--[-->');

																	Picker.RadioItem($$renderer, {
																		value: theme.name,
																		closeOnSelect: false,
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->${$.escape(theme.title)}`);
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
				prop: 'chartColor',
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