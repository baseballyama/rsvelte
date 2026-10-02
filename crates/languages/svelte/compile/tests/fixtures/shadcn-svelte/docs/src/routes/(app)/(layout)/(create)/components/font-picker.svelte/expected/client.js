import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { FONTS } from "$lib/fonts.js";
import { IsMobile } from "$lib/registry/hooks/is-mobile.svelte.js";
import * as Picker from "./picker/index.js";
import LockButton from "./lock-button.svelte";

var root = $.from_html(`<div class="flex flex-col justify-start text-left"><div class="text-xs text-muted-foreground"> </div> <div class="text-sm font-medium text-foreground"> </div></div> <div class="pointer-events-none absolute top-1/2 right-4 flex size-4 -translate-y-1/2 items-center justify-center text-base text-foreground select-none md:right-2.5">Aa</div>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="group/picker relative"><!> <!></div>`);

export default function Font_picker($$anchor, $$props) {
	$.push($$props, true);

	let submenu = $.prop($$props, 'submenu', 3, false);
	const designSystem = useDesignSystem();
	const isMobile = new IsMobile();
	const currentValue = $.derived(() => $$props.param === "font" ? designSystem.font : designSystem.fontHeading);
	const currentFont = $.derived(() => $$props.fonts.find((font) => font.value === $.get(currentValue)));
	const currentBodyFont = $.derived(() => FONTS.find((font) => font.value === designSystem.font));
	const inheritsBodyFont = $.derived(() => $$props.param === "fontHeading" && $.get(currentValue) === "inherit");

	const displayFontName = $.derived(() => $.get(inheritsBodyFont)
		? $.get(currentBodyFont)?.name
		: $.get(currentFont)?.name);

	const inheritFontLabel = $.derived(() => $.get(currentBodyFont) ? $.get(currentBodyFont).name : "Body font");

	const groupedFonts = $.derived(() => {
		const pickerFonts = $$props.param === "fontHeading"
			? $$props.fonts.filter((font) => font.value !== "inherit")
			: [...$$props.fonts];

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

	const previewFontFamily = $.derived(() => $.get(currentFont)?.font?.style?.fontFamily ?? $.get(currentBodyFont)?.font?.style?.fontFamily);
	var div = root_2();
	var node = $.child(div);

	$.component(node, () => Picker.Root, ($$anchor, Picker_Root) => {
		Picker_Root($$anchor, {
			get submenu() {
				return submenu();
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Picker.Trigger, ($$anchor, Picker_Trigger) => {
					Picker_Trigger($$anchor, {
						get submenu() {
							return submenu();
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var div_1 = $.first_child(fragment_1);
							var div_2 = $.child(div_1);
							var text = $.only_child(div_2, true);
							var div_3 = $.sibling(div_2, 2);
							var text_1 = $.only_child(div_3, true);

							$.reset(div_1);

							var div_4 = $.sibling(div_1, 2);

							$.template_effect(() => {
								$.set_text(text, $$props.label);
								$.set_text(text_1, $.get(displayFontName));
								$.set_style(div_4, `font-family: ${$.get(previewFontFamily) ?? ''}`);
							});

							$.append($$anchor, fragment_1);
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
							class: 'max-h-96 overflow-y-auto md:w-72',
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
											return designSystem[$$props.param];
										},

										set value($$value) {
											designSystem[$$props.param] = $$value;
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_3 = root_1();
											var node_4 = $.first_child(fragment_3);

											{
												var consequent = ($$anchor) => {
													var fragment_4 = root_1();
													var node_5 = $.first_child(fragment_4);

													$.component(node_5, () => Picker.Group, ($$anchor, Picker_Group) => {
														Picker_Group($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = $.comment();
																var node_6 = $.first_child(fragment_5);

																$.component(node_6, () => Picker.RadioItem, ($$anchor, Picker_RadioItem) => {
																	Picker_RadioItem($$anchor, {
																		value: 'inherit',
																		get closeOnSelect() {
																			return isMobile.current;
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_2 = $.text();

																			$.template_effect(() => $.set_text(text_2, $.get(inheritFontLabel)));
																			$.append($$anchor, text_2);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_5);
															},
															$$slots: { default: true }
														});
													});

													var node_7 = $.sibling(node_5, 2);

													$.component(node_7, () => Picker.Separator, ($$anchor, Picker_Separator) => {
														Picker_Separator($$anchor, { class: 'opacity-50' });
													});

													$.append($$anchor, fragment_4);
												};

												$.if(node_4, ($$render) => {
													if ($$props.param === "fontHeading") $$render(consequent);
												});
											}

											var node_8 = $.sibling(node_4, 2);

											$.each(node_8, 17, () => $.get(groupedFonts), (group) => group.type, ($$anchor, group) => {
												var fragment_7 = $.comment();
												var node_9 = $.first_child(fragment_7);

												$.component(node_9, () => Picker.Group, ($$anchor, Picker_Group_1) => {
													Picker_Group_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_8 = root_1();
															var node_10 = $.first_child(fragment_8);

															$.component(node_10, () => Picker.Label, ($$anchor, Picker_Label) => {
																Picker_Label($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text();

																		$.template_effect(() => $.set_text(text_3, $.get(group).label));
																		$.append($$anchor, text_3);
																	},
																	$$slots: { default: true }
																});
															});

															var node_11 = $.sibling(node_10, 2);

															$.each(node_11, 17, () => $.get(group).items, (font) => font.value, ($$anchor, font) => {
																var fragment_10 = $.comment();
																var node_12 = $.first_child(fragment_10);

																$.component(node_12, () => Picker.RadioItem, ($$anchor, Picker_RadioItem_1) => {
																	Picker_RadioItem_1($$anchor, {
																		get value() {
																			return $.get(font).value;
																		},

																		get closeOnSelect() {
																			return isMobile.current;
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_4 = $.text();

																			$.template_effect(() => $.set_text(text_4, $.get(font).name));
																			$.append($$anchor, text_4);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_10);
															});

															$.append($$anchor, fragment_8);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_7);
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

	var node_13 = $.sibling(node, 2);

	LockButton(node_13, {
		get prop() {
			return $$props.param;
		},
		class: 'absolute top-1/2 right-8 -translate-y-1/2'
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}