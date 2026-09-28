import * as $ from 'svelte/internal/server';
import { browser } from "$app/environment";
import MenuIcon from "@lucide/svelte/icons/menu";
import { mode } from "mode-watcher";
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { IsMobile } from "$lib/registry/hooks/is-mobile.svelte.js";
import * as Picker from "./picker/index.js";
import LockButton from "./lock-button.svelte";

export default function Menu_color_picker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { submenu = false } = $$props;
		const designSystem = useDesignSystem();
		const isMobile = new IsMobile();

		const MENU_OPTIONS = [
			{ value: "default", label: "Default / Solid" },
			{ value: "default-translucent", label: "Default / Translucent" },
			{ value: "inverted", label: "Inverted / Solid" },
			{
				value: "inverted-translucent",
				label: "Inverted / Translucent"
			}
		];

		function getMenuColorValue(color, translucent) {
			if (color === "default") {
				return translucent ? "default-translucent" : "default";
			}

			return translucent ? "inverted-translucent" : "inverted";
		}

		function isTranslucentMenuColor(value) {
			return value === "default-translucent" || value === "inverted-translucent";
		}

		const currentMenu = $.derived(() => MENU_OPTIONS.find((menu) => menu.value === designSystem.menuColor) ?? MENU_OPTIONS[0]);
		const colorChoice = $.derived(() => designSystem.menuColor === "inverted" || designSystem.menuColor === "inverted-translucent" ? "inverted" : "default");
		const surfaceChoice = $.derived(() => designSystem.menuColor === "default-translucent" || designSystem.menuColor === "inverted-translucent" ? "translucent" : "solid");
		const mounted = $.derived(() => browser);
		const isDark = $.derived(() => mounted() && mode.current === "dark");
		let lastSolidMenuAccent = designSystem.menuAccent;

		function setColor(color) {
			const nextMenuColor = getMenuColorValue(color, surfaceChoice() === "translucent");

			designSystem.menuColor = nextMenuColor;

			if (isTranslucentMenuColor(nextMenuColor)) {
				designSystem.menuAccent = "subtle";
			}
		}

		function setSurface(choice) {
			const isTranslucent = choice === "translucent";
			const nextMenuColor = getMenuColorValue(colorChoice(), isTranslucent);

			designSystem.menuColor = nextMenuColor;
			designSystem.menuAccent = isTranslucent ? "subtle" : lastSolidMenuAccent;
		}

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
								$$renderer.push(`<div class="flex min-w-0 flex-1 flex-col justify-start overflow-hidden pr-8 text-left md:pr-7"><div class="text-xs text-muted-foreground">Menu</div> <div class="overflow-hidden text-sm font-medium text-ellipsis whitespace-nowrap text-foreground">${$.escape(currentMenu().label)}</div></div> <div class="pointer-events-none absolute top-1/2 right-4 flex size-4 -translate-y-1/2 items-center justify-center text-base text-foreground select-none md:right-2.5">`);
								MenuIcon($$renderer, { class: 'size-4', strokeWidth: 2 });
								$$renderer.push(`<!----></div>`);
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
								if (Picker.Group) {
									$$renderer.push('<!--[-->');

									Picker.Group($$renderer, {
										children: ($$renderer) => {
											if (Picker.Label) {
												$$renderer.push('<!--[-->');

												Picker.Label($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Color`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Picker.RadioGroup) {
												$$renderer.push('<!--[-->');

												Picker.RadioGroup($$renderer, {
													value: colorChoice(),
													onValueChange: (value) => setColor(value),
													children: ($$renderer) => {
														if (Picker.RadioItem) {
															$$renderer.push('<!--[-->');

															Picker.RadioItem($$renderer, {
																value: 'default',
																closeOnSelect: isMobile.current,
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Default`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Picker.RadioItem) {
															$$renderer.push('<!--[-->');

															Picker.RadioItem($$renderer, {
																value: 'inverted',
																closeOnSelect: isMobile.current,
																disabled: isDark(),
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Inverted`);
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
											if (Picker.Label) {
												$$renderer.push('<!--[-->');

												Picker.Label($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Appearance`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Picker.RadioGroup) {
												$$renderer.push('<!--[-->');

												Picker.RadioGroup($$renderer, {
													value: surfaceChoice(),
													onValueChange: (value) => setSurface(value),
													children: ($$renderer) => {
														if (Picker.RadioItem) {
															$$renderer.push('<!--[-->');

															Picker.RadioItem($$renderer, {
																value: 'solid',
																closeOnSelect: isMobile.current,
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Solid`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Picker.RadioItem) {
															$$renderer.push('<!--[-->');

															Picker.RadioItem($$renderer, {
																value: 'translucent',
																closeOnSelect: isMobile.current,
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Translucent`);
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
			prop: 'menuColor',
			class: 'absolute top-1/2 right-8 -translate-y-1/2'
		});

		$$renderer.push(`<!----></div>`);
	});
}