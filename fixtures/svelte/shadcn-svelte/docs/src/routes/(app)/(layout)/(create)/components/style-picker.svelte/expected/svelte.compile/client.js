import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { STYLES } from "$lib/registry/config.js";
import { IsMobile } from "$lib/registry/hooks/is-mobile.svelte.js";
import * as Picker from "./picker/index.js";
import LockButton from "./lock-button.svelte";

var root = $.from_html(`<div class="flex flex-col justify-start text-left"><div class="text-xs text-muted-foreground">Style</div> <div class="text-sm font-medium text-foreground"> </div></div> <div class="pointer-events-none absolute top-1/2 right-4 flex size-4 -translate-y-1/2 items-center justify-center select-none"><!></div>`, 1);
var root_1 = $.from_html(`<div class="flex items-start gap-2"><div class="flex size-4 translate-y-0.5 items-center justify-center"><!></div> <div class="flex flex-col justify-start pointer-coarse:gap-1"><div> </div> <div class="text-xs text-muted-foreground! pointer-coarse:text-sm"> </div></div></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="group/picker relative"><!> <!></div>`);

export default function Style_picker($$anchor, $$props) {
	$.push($$props, true);

	let submenu = $.prop($$props, 'submenu', 3, false);
	const designSystem = useDesignSystem();
	const currentStyle = $.derived(() => STYLES.find((style) => style.name === designSystem.style) ?? STYLES[0]);
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

						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var div_1 = $.first_child(fragment_1);
							var div_2 = $.sibling($.child(div_1), 2);
							var text = $.only_child(div_2, true);

							$.reset(div_1);

							var div_3 = $.sibling(div_1, 2);
							var node_2 = $.child(div_3);

							$.component(node_2, () => $.get(currentStyle).icon, ($$anchor, currentStyle_icon) => {
								currentStyle_icon($$anchor, { class: 'size-4' });
							});

							$.reset(div_3);
							$.template_effect(() => $.set_text(text, $.get(currentStyle)?.title));
							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_1, 2);

				{
					let $0 = $.derived(() => isMobile.current ? "top" : submenu() ? "left" : "right");
					let $1 = $.derived(() => isMobile.current ? "center" : "start");
					let $2 = $.derived(() => submenu() ? 5 : 20);

					$.component(node_3, () => Picker.Content, ($$anchor, Picker_Content) => {
						Picker_Content($$anchor, {
							get side() {
								return $.get($0);
							},

							get align() {
								return $.get($1);
							},
							class: 'md:w-64',
							get sideOffset() {
								return $.get($2);
							},

							get submenu() {
								return submenu();
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_2 = $.comment();
								var node_4 = $.first_child(fragment_2);

								$.component(node_4, () => Picker.RadioGroup, ($$anchor, Picker_RadioGroup) => {
									Picker_RadioGroup($$anchor, {
										get value() {
											return designSystem.style;
										},

										set value($$value) {
											designSystem.style = $$value;
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_3 = $.comment();
											var node_5 = $.first_child(fragment_3);

											$.component(node_5, () => Picker.Group, ($$anchor, Picker_Group) => {
												Picker_Group($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_4 = $.comment();
														var node_6 = $.first_child(fragment_4);

														$.each(node_6, 19, () => STYLES, (style) => style.name, ($$anchor, style, i) => {
															var fragment_5 = root_2();
															var node_7 = $.first_child(fragment_5);

															$.component(node_7, () => Picker.RadioItem, ($$anchor, Picker_RadioItem) => {
																Picker_RadioItem($$anchor, {
																	get value() {
																		return $.get(style).name;
																	},
																	closeOnSelect: false,
																	children: ($$anchor, $$slotProps) => {
																		var div_4 = root_1();
																		var div_5 = $.child(div_4);
																		var node_8 = $.child(div_5);

																		$.component(node_8, () => $.get(style).icon, ($$anchor, style_icon) => {
																			style_icon($$anchor, { class: 'size-4' });
																		});

																		$.reset(div_5);

																		var div_6 = $.sibling(div_5, 2);
																		var div_7 = $.child(div_6);
																		var text_1 = $.only_child(div_7, true);
																		var div_8 = $.sibling(div_7, 2);
																		var text_2 = $.only_child(div_8, true);

																		$.reset(div_6);
																		$.reset(div_4);

																		$.template_effect(() => {
																			$.set_text(text_1, $.get(style).title);
																			$.set_text(text_2, $.get(style).description);
																		});

																		$.append($$anchor, div_4);
																	},
																	$$slots: { default: true }
																});
															});

															var node_9 = $.sibling(node_7, 2);

															{
																var consequent = ($$anchor) => {
																	var fragment_6 = $.comment();
																	var node_10 = $.first_child(fragment_6);

																	$.component(node_10, () => Picker.Separator, ($$anchor, Picker_Separator) => {
																		Picker_Separator($$anchor, {});
																	});

																	$.append($$anchor, fragment_6);
																};

																$.if(node_9, ($$render) => {
																	if ($.get(i) < STYLES.length - 1) $$render(consequent);
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

	var node_11 = $.sibling(node, 2);

	LockButton(node_11, {
		prop: 'style',
		class: 'absolute top-1/2 right-10 -translate-y-1/2'
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}