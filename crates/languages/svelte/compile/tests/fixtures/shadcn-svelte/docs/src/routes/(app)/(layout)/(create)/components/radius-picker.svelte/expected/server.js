import * as $ from 'svelte/internal/server';
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { RADII } from "$lib/registry/config.js";
import { IsMobile } from "$lib/registry/hooks/is-mobile.svelte.js";
import * as Picker from "./picker/index.js";
import LockButton from "./lock-button.svelte";

export default function Radius_picker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { submenu = false } = $$props;
		const designSystem = useDesignSystem();
		const isRadiusLocked = $.derived(() => designSystem.style === "lyra" || designSystem.style === "sera");
		const isLargeRadiusDisabled = $.derived(() => designSystem.style === "rhea");
		const selectedRadiusName = $.derived(() => isRadiusLocked() ? "none" : designSystem.radius);
		const currentRadius = $.derived(() => RADII.find((radius) => radius.name === selectedRadiusName()) ?? RADII[0]);
		const isMobile = new IsMobile();
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
								disabled: isRadiusLocked(),
								children: ($$renderer) => {
									$$renderer.push(`<div class="flex flex-col justify-start text-left"><div class="text-xs text-muted-foreground">Radius</div> <div class="text-sm font-medium text-foreground">${$.escape(currentRadius()?.label)}</div></div> <div class="pointer-events-none absolute top-1/2 right-4 flex size-4 -translate-y-1/2 items-center justify-center text-base text-foreground select-none"><div class="size-4 border-t-2 border-r-2 border-current transition-all"${$.attr_style(`border-top-right-radius: ${$.stringify(currentRadius()?.value)};`)}></div></div>`);
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
									var bind_get = () => selectedRadiusName();

									var bind_set = (value) => {
										if (isRadiusLocked()) return;

										designSystem.radius = value;
									};

									if (Picker.RadioGroup) {
										$$renderer.push('<!--[-->');

										Picker.RadioGroup($$renderer, {
											get value() {
												return bind_get();
											},

											set value($$value) {
												bind_set($$value);
											},

											children: ($$renderer) => {
												if (Picker.Group) {
													$$renderer.push('<!--[-->');

													Picker.Group($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!--[-->`);

															const each_array = $.ensure_array_like(RADII);

															for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																let radius = each_array[$$index];

																if (radius.name === "default") {
																	$$renderer.push('<!--[0-->');

																	if (Picker.RadioItem) {
																		$$renderer.push('<!--[-->');

																		Picker.RadioItem($$renderer, {
																			value: radius.name,
																			closeOnSelect: false,
																			children: ($$renderer) => {
																				$$renderer.push(`<div class="flex flex-col justify-start pointer-coarse:gap-1"><div>${$.escape(radius.label)}</div> <div class="text-xs text-muted-foreground pointer-coarse:text-sm">Use radius from style</div></div>`);
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
																} else {
																	$$renderer.push('<!--[-1-->');

																	if (Picker.RadioItem) {
																		$$renderer.push('<!--[-->');

																		Picker.RadioItem($$renderer, {
																			value: radius.name,
																			closeOnSelect: false,
																			disabled: isLargeRadiusDisabled() && radius.name === "large",
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(radius.label)}`);
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
				prop: 'radius',
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