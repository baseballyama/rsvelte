import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { MENU_ACCENTS } from "$lib/registry/config.js";
import { IsMobile } from "$lib/registry/hooks/is-mobile.svelte.js";
import * as Picker from "./picker/index.js";
import LockButton from "./lock-button.svelte";

var root = $.from_html(`<div class="flex flex-col justify-start text-left"><div class="text-xs text-muted-foreground">Menu Accent</div> <div class="text-sm font-medium text-foreground"> </div></div> <div class="pointer-events-none absolute top-1/2 right-4 flex size-4 -translate-y-1/2 items-center justify-center text-base text-foreground select-none"><svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="none" class="size-4 text-foreground"><path d="M19 12.1294L12.9388 18.207C11.1557 19.9949 10.2641 20.8889 9.16993 20.9877C8.98904 21.0041 8.80705 21.0041 8.62616 20.9877C7.53195 20.8889 6.64039 19.9949 4.85726 18.207L2.83687 16.1811C1.72104 15.0622 1.72104 13.2482 2.83687 12.1294M19 12.1294L10.9184 4.02587M19 12.1294H2.83687M10.9184 4.02587L2.83687 12.1294M10.9184 4.02587L8.89805 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="fill-muted-foreground/30 data-[accent=bold]:fill-foreground"></path><path d="M22 20C22 21.1046 21.1046 22 20 22C18.8954 22 18 21.1046 18 20C18 18.8954 20 17 20 17C20 17 22 18.8954 22 20Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="fill-muted-foreground/30 data-[accent=bold]:fill-foreground"></path></svg></div>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="group/picker relative"><!> <!></div>`);

export default function Menu_accent_picker($$anchor, $$props) {
	$.push($$props, true);

	let submenu = $.prop($$props, 'submenu', 3, false);
	const designSystem = useDesignSystem();
	const isMobile = new IsMobile();
	const currentAccent = $.derived(() => MENU_ACCENTS.find((accent) => accent.value === designSystem.menuAccent) ?? MENU_ACCENTS[0]);
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
							var div_2 = $.sibling($.child(div_1), 2);
							var text = $.only_child(div_2, true);

							$.reset(div_1);

							var div_3 = $.sibling(div_1, 2);
							var svg = $.child(div_3);
							var path = $.child(svg);
							var path_1 = $.sibling(path);

							$.reset(svg);
							$.reset(div_3);

							$.template_effect(() => {
								$.set_text(text, $.get(currentAccent).label);
								$.set_attribute(path, 'data-accent', $.get(currentAccent).value);
								$.set_attribute(path_1, 'data-accent', $.get(currentAccent).value);
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

								$.component(node_3, () => Picker.RadioGroup, ($$anchor, Picker_RadioGroup) => {
									Picker_RadioGroup($$anchor, {
										get value() {
											return $.get(currentAccent).value;
										},

										onValueChange: (value) => {
											designSystem.menuAccent = value;
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_3 = $.comment();
											var node_4 = $.first_child(fragment_3);

											$.component(node_4, () => Picker.Group, ($$anchor, Picker_Group) => {
												Picker_Group($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_4 = $.comment();
														var node_5 = $.first_child(fragment_4);

														$.each(node_5, 17, () => MENU_ACCENTS, (accent) => accent.value, ($$anchor, accent) => {
															var fragment_5 = $.comment();
															var node_6 = $.first_child(fragment_5);

															$.component(node_6, () => Picker.RadioItem, ($$anchor, Picker_RadioItem) => {
																Picker_RadioItem($$anchor, {
																	get value() {
																		return $.get(accent).value;
																	},
																	closeOnSelect: false,
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_1 = $.text();

																		$.template_effect(() => $.set_text(text_1, $.get(accent).label));
																		$.append($$anchor, text_1);
																	},
																	$$slots: { default: true }
																});
															});

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

	var node_7 = $.sibling(node, 2);

	LockButton(node_7, {
		prop: 'menuAccent',
		class: 'absolute top-1/2 right-10 -translate-y-1/2'
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}