import * as $ from 'svelte/internal/server';
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { STYLES } from "$lib/registry/config.js";
import { IsMobile } from "$lib/registry/hooks/is-mobile.svelte.js";
import * as Picker from "./picker/index.js";
import LockButton from "./lock-button.svelte";

export default function Style_picker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { submenu = false } = $$props;
		const designSystem = useDesignSystem();
		const currentStyle = $.derived(() => STYLES.find((style) => style.name === designSystem.style) ?? STYLES[0]);
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
								children: ($$renderer) => {
									$$renderer.push(`<div class="flex flex-col justify-start text-left"><div class="text-xs text-muted-foreground">Style</div> <div class="text-sm font-medium text-foreground">${$.escape(currentStyle()?.title)}</div></div> <div class="pointer-events-none absolute top-1/2 right-4 flex size-4 -translate-y-1/2 items-center justify-center select-none">`);

									if (currentStyle().icon) {
										$$renderer.push('<!--[-->');
										currentStyle().icon($$renderer, { class: 'size-4' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(`</div>`);
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
								class: 'md:w-64',
								sideOffset: submenu ? 5 : 20,
								submenu,
								children: ($$renderer) => {
									if (Picker.RadioGroup) {
										$$renderer.push('<!--[-->');

										Picker.RadioGroup($$renderer, {
											get value() {
												return designSystem.style;
											},

											set value($$value) {
												designSystem.style = $$value;
												$$settled = false;
											},

											children: ($$renderer) => {
												if (Picker.Group) {
													$$renderer.push('<!--[-->');

													Picker.Group($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!--[-->`);

															const each_array = $.ensure_array_like(STYLES);

															for (let i = 0, $$length = each_array.length; i < $$length; i++) {
																let style = each_array[i];

																if (Picker.RadioItem) {
																	$$renderer.push('<!--[-->');

																	Picker.RadioItem($$renderer, {
																		value: style.name,
																		closeOnSelect: false,
																		children: ($$renderer) => {
																			$$renderer.push(`<div class="flex items-start gap-2"><div class="flex size-4 translate-y-0.5 items-center justify-center">`);

																			if (style.icon) {
																				$$renderer.push('<!--[-->');
																				style.icon($$renderer, { class: 'size-4' });
																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(`</div> <div class="flex flex-col justify-start pointer-coarse:gap-1"><div>${$.escape(style.title)}</div> <div class="text-xs text-muted-foreground! pointer-coarse:text-sm">${$.escape(style.description)}</div></div></div>`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (i < STYLES.length - 1) {
																	$$renderer.push('<!--[0-->');

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
				prop: 'style',
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