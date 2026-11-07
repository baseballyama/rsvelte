import * as $ from 'svelte/internal/server';
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { FONTS } from "$lib/fonts.js";
import { IsMobile } from "$lib/registry/hooks/is-mobile.svelte.js";
import * as Picker from "./picker/index.js";
import LockButton from "./lock-button.svelte";

export default function Font_picker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { submenu = false, fonts, label, param } = $$props;
		const designSystem = useDesignSystem();
		const isMobile = new IsMobile();
		const currentValue = $.derived(() => param === "font" ? designSystem.font : designSystem.fontHeading);
		const currentFont = $.derived(() => fonts.find((font) => font.value === currentValue()));
		const currentBodyFont = $.derived(() => FONTS.find((font) => font.value === designSystem.font));
		const inheritsBodyFont = $.derived(() => param === "fontHeading" && currentValue() === "inherit");
		const displayFontName = $.derived(() => inheritsBodyFont() ? currentBodyFont()?.name : currentFont()?.name);
		const inheritFontLabel = $.derived(() => currentBodyFont() ? currentBodyFont().name : "Body font");

		const groupedFonts = $.derived(() => {
			const pickerFonts = param === "fontHeading"
				? fonts.filter((font) => font.value !== "inherit")
				: [...fonts];

			const byType = {};
			const typeOrder = [];

			for (const font of pickerFonts) {
				if (!byType[font.type]) {
					byType[font.type] = [];
					typeOrder.push(font.type);
				}

				byType[font.type].push(font);
			}

			return typeOrder.map((type) => ({
				type,
				label: `${type.charAt(0).toUpperCase()}${type.slice(1)}`,
				items: byType[type]
			}));
		});

		const previewFontFamily = $.derived(() => currentFont()?.font?.style?.fontFamily ?? currentBodyFont()?.font?.style?.fontFamily);
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
									$$renderer.push(`<div class="flex flex-col justify-start text-left"><div class="text-xs text-muted-foreground">${$.escape(label)}</div> <div class="text-sm font-medium text-foreground">${$.escape(displayFontName())}</div></div> <div class="pointer-events-none absolute top-1/2 right-4 flex size-4 -translate-y-1/2 items-center justify-center text-base text-foreground select-none md:right-2.5"${$.attr_style(`font-family: ${$.stringify(previewFontFamily())}`)}>Aa</div>`);
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
								class: 'max-h-96 overflow-y-auto md:w-72',
								sideOffset: submenu ? 5 : 20,
								submenu,
								children: ($$renderer) => {
									if (Picker.RadioGroup) {
										$$renderer.push('<!--[-->');

										Picker.RadioGroup($$renderer, {
											get value() {
												return designSystem[param];
											},

											set value($$value) {
												designSystem[param] = $$value;
												$$settled = false;
											},

											children: ($$renderer) => {
												if (param === "fontHeading") {
													$$renderer.push('<!--[0-->');

													if (Picker.Group) {
														$$renderer.push('<!--[-->');

														Picker.Group($$renderer, {
															children: ($$renderer) => {
																if (Picker.RadioItem) {
																	$$renderer.push('<!--[-->');

																	Picker.RadioItem($$renderer, {
																		value: 'inherit',
																		closeOnSelect: isMobile.current,
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->${$.escape(inheritFontLabel())}`);
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
														Picker.Separator($$renderer, { class: 'opacity-50' });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]--> <!--[-->`);

												const each_array = $.ensure_array_like(groupedFonts());

												for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
													let group = each_array[$$index_1];

													if (Picker.Group) {
														$$renderer.push('<!--[-->');

														Picker.Group($$renderer, {
															children: ($$renderer) => {
																if (Picker.Label) {
																	$$renderer.push('<!--[-->');

																	Picker.Label($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->${$.escape(group.label)}`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` <!--[-->`);

																const each_array_1 = $.ensure_array_like(group.items);

																for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
																	let font = each_array_1[$$index];

																	if (Picker.RadioItem) {
																		$$renderer.push('<!--[-->');

																		Picker.RadioItem($$renderer, {
																			value: font.value,
																			closeOnSelect: isMobile.current,
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(font.name)}`);
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

			$$renderer.push(` `);

			LockButton($$renderer, {
				prop: param,
				class: 'absolute top-1/2 right-8 -translate-y-1/2'
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