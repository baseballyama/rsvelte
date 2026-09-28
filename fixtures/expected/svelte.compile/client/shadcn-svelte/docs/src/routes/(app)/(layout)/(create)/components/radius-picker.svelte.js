import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { RADII } from "$lib/registry/config.js";
import { IsMobile } from "$lib/registry/hooks/is-mobile.svelte.js";
import * as Picker from "./picker/index.js";
import LockButton from "./lock-button.svelte";

var root = $.from_html(`<div class="flex flex-col justify-start text-left"><div class="text-xs text-muted-foreground">Radius</div> <div class="text-sm font-medium text-foreground"> </div></div> <div class="pointer-events-none absolute top-1/2 right-4 flex size-4 -translate-y-1/2 items-center justify-center text-base text-foreground select-none"><div class="size-4 border-t-2 border-r-2 border-current transition-all"></div></div>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col justify-start pointer-coarse:gap-1"><div> </div> <div class="text-xs text-muted-foreground pointer-coarse:text-sm">Use radius from style</div></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="group/picker relative"><!> <!></div>`);

export default function Radius_picker($$anchor, $$props) {
	$.push($$props, true);

	let submenu = $.prop($$props, 'submenu', 3, false);
	const designSystem = useDesignSystem();
	const isRadiusLocked = $.derived(() => designSystem.style === "lyra" || designSystem.style === "sera");
	const isLargeRadiusDisabled = $.derived(() => designSystem.style === "rhea");
	const selectedRadiusName = $.derived(() => $.get(isRadiusLocked) ? "none" : designSystem.radius);
	const currentRadius = $.derived(() => RADII.find((radius) => radius.name === $.get(selectedRadiusName)) ?? RADII[0]);
	const isMobile = new IsMobile();
	var div = root_3();
	var node = $.child(div);

	$.component(node, () => Picker.Root, ($$anchor, Picker_Root) => {
		Picker_Root($$anchor, {
			get submenu() {
				return submenu();
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_2();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Picker.Trigger, ($$anchor, Picker_Trigger) => {
					Picker_Trigger($$anchor, {
						get submenu() {
							return submenu();
						},

						get disabled() {
							return $.get(isRadiusLocked);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var div_1 = $.first_child(fragment_1);
							var div_2 = $.sibling($.child(div_1), 2);
							var text = $.only_child(div_2, true);

							$.reset(div_1);

							var div_3 = $.sibling(div_1, 2);
							var div_4 = $.only_child(div_3);

							$.template_effect(() => {
								$.set_text(text, $.get(currentRadius)?.label);
								$.set_style(div_4, `border-top-right-radius: ${$.get(currentRadius)?.value ?? ''};`);
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

							get sideOffset() {
								return $.get($2);
							},

							get submenu() {
								return submenu();
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_2 = $.comment();
								var node_3 = $.first_child(fragment_2);
								var bind_get = () => $.get(selectedRadiusName);

								var bind_set = (value) => {
									if ($.get(isRadiusLocked)) return;

									designSystem.radius = value;
								};

								$.component(node_3, () => Picker.RadioGroup, ($$anchor, Picker_RadioGroup) => {
									Picker_RadioGroup($$anchor, {
										get value() {
											return bind_get();
										},

										set value($$value) {
											bind_set($$value);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_3 = $.comment();
											var node_4 = $.first_child(fragment_3);

											$.component(node_4, () => Picker.Group, ($$anchor, Picker_Group) => {
												Picker_Group($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_4 = $.comment();
														var node_5 = $.first_child(fragment_4);

														$.each(node_5, 17, () => RADII, (radius) => radius.name, ($$anchor, radius) => {
															var fragment_5 = $.comment();
															var node_6 = $.first_child(fragment_5);

															{
																var consequent = ($$anchor) => {
																	var fragment_6 = root_2();
																	var node_7 = $.first_child(fragment_6);

																	$.component(node_7, () => Picker.RadioItem, ($$anchor, Picker_RadioItem) => {
																		Picker_RadioItem($$anchor, {
																			get value() {
																				return $.get(radius).name;
																			},
																			closeOnSelect: false,
																			children: ($$anchor, $$slotProps) => {
																				var div_5 = root_1();
																				var div_6 = $.child(div_5);
																				var text_1 = $.only_child(div_6, true);

																				$.next(2);
																				$.reset(div_5);
																				$.template_effect(() => $.set_text(text_1, $.get(radius).label));
																				$.append($$anchor, div_5);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_8 = $.sibling(node_7, 2);

																	$.component(node_8, () => Picker.Separator, ($$anchor, Picker_Separator) => {
																		Picker_Separator($$anchor, {});
																	});

																	$.append($$anchor, fragment_6);
																};

																var alternate = ($$anchor) => {
																	var fragment_7 = $.comment();
																	var node_9 = $.first_child(fragment_7);

																	{
																		let $0 = $.derived(() => $.get(isLargeRadiusDisabled) && $.get(radius).name === "large");

																		$.component(node_9, () => Picker.RadioItem, ($$anchor, Picker_RadioItem_1) => {
																			Picker_RadioItem_1($$anchor, {
																				get value() {
																					return $.get(radius).name;
																				},
																				closeOnSelect: false,
																				get disabled() {
																					return $.get($0);
																				},

																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_2 = $.text();

																					$.template_effect(() => $.set_text(text_2, $.get(radius).label));
																					$.append($$anchor, text_2);
																				},
																				$$slots: { default: true }
																			});
																		});
																	}

																	$.append($$anchor, fragment_7);
																};

																$.if(node_6, ($$render) => {
																	if ($.get(radius).name === "default") $$render(consequent); else $$render(alternate, -1);
																});
															}

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

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_10 = $.sibling(node, 2);

	LockButton(node_10, {
		prop: 'radius',
		class: 'absolute top-1/2 right-10 -translate-y-1/2'
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}