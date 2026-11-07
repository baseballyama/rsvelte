import * as $ from 'svelte/internal/server';
import { mode, setMode } from "mode-watcher";
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { BASE_THEMES } from "$lib/registry/config.js";
import { IsMobile } from "$lib/registry/hooks/is-mobile.svelte.js";
import * as Picker from "./picker/index.js";
import LockButton from "./lock-button.svelte";

export default function Base_color_picker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { submenu = false } = $$props;
		const designSystem = useDesignSystem();
		const isMobile = new IsMobile();
		const currentBaseColor = $.derived(() => BASE_THEMES.find((base) => base.name === designSystem.baseColor) ?? BASE_THEMES[0]);
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
									$$renderer.push(`<div class="flex flex-col justify-start text-left"><div class="text-xs text-muted-foreground">Base Color</div> <div class="text-sm font-medium text-foreground">${$.escape(currentBaseColor()?.title)}</div></div> <div${$.attr_style(`--color: ${$.stringify(currentBaseColor()?.cssVars?.[mode.current]?.['muted-foreground'])}`)} class="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 rounded-full bg-(--color) select-none"></div>`);
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
								sideOffset: submenu ? 5 : 20,
								submenu,
								children: ($$renderer) => {
									if (Picker.RadioGroup) {
										$$renderer.push('<!--[-->');

										Picker.RadioGroup($$renderer, {
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
												$$settled = false;
											},

											children: ($$renderer) => {
												if (Picker.Group) {
													$$renderer.push('<!--[-->');

													Picker.Group($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!--[-->`);

															const each_array = $.ensure_array_like(BASE_THEMES);

															for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																let baseColor = each_array[$$index];

																if (Picker.RadioItem) {
																	$$renderer.push('<!--[-->');

																	Picker.RadioItem($$renderer, {
																		value: baseColor.name,
																		closeOnSelect: false,
																		children: ($$renderer) => {
																			$$renderer.push(`<div class="flex items-center gap-2">`);

																			if (mode.current) {
																				$$renderer.push(`<!--[0--><div${$.attr_style(`--color: ${$.stringify(baseColor.cssVars?.[mode.current]?.['muted-foreground'])};`)} class="size-4 rounded-full bg-(--color)"></div>`);
																			} else {
																				$$renderer.push('<!--[-1-->');
																			}

																			$$renderer.push(`<!--]--> ${$.escape(baseColor.title)}</div>`);
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
															if (Picker.Item) {
																$$renderer.push('<!--[-->');

																Picker.Item($$renderer, {
																	closeOnSelect: false,
																	onclick: () => {
																		setMode(mode.current === "dark" ? "light" : "dark");
																	},

																	children: ($$renderer) => {
																		$$renderer.push(`<div class="flex flex-col justify-start pointer-coarse:gap-1"><div>Switch to ${$.escape(mode.current === "dark" ? "Light" : "Dark")} Mode</div> <div class="text-xs text-muted-foreground pointer-coarse:text-sm">Base colors are easier to see in dark mode.</div></div>`);
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
				prop: 'baseColor',
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