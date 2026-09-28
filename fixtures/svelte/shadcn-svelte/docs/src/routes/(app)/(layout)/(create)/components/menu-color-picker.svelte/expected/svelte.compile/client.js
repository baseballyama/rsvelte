import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser } from "$app/environment";
import MenuIcon from "@lucide/svelte/icons/menu";
import { mode } from "mode-watcher";
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { IsMobile } from "$lib/registry/hooks/is-mobile.svelte.js";
import * as Picker from "./picker/index.js";
import LockButton from "./lock-button.svelte";

var root = $.from_html(`<div class="flex min-w-0 flex-1 flex-col justify-start overflow-hidden pr-8 text-left md:pr-7"><div class="text-xs text-muted-foreground">Menu</div> <div class="overflow-hidden text-sm font-medium text-ellipsis whitespace-nowrap text-foreground"> </div></div> <div class="pointer-events-none absolute top-1/2 right-4 flex size-4 -translate-y-1/2 items-center justify-center text-base text-foreground select-none md:right-2.5"><!></div>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="group/picker relative"><!> <!></div>`);

export default function Menu_color_picker($$anchor, $$props) {
	$.push($$props, true);

	let submenu = $.prop($$props, 'submenu', 3, false);
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
	const isDark = $.derived(() => $.get(mounted) && mode.current === "dark");
	let lastSolidMenuAccent = $.state($.proxy(designSystem.menuAccent));

	$.user_effect(() => {
		if ($.get(surfaceChoice) === "solid") {
			$.set(lastSolidMenuAccent, designSystem.menuAccent, true);
		}
	});

	function setColor(color) {
		const nextMenuColor = getMenuColorValue(color, $.get(surfaceChoice) === "translucent");

		designSystem.menuColor = nextMenuColor;

		if (isTranslucentMenuColor(nextMenuColor)) {
			designSystem.menuAccent = "subtle";
		}
	}

	function setSurface(choice) {
		const isTranslucent = choice === "translucent";
		const nextMenuColor = getMenuColorValue($.get(colorChoice), isTranslucent);

		designSystem.menuColor = nextMenuColor;
		designSystem.menuAccent = isTranslucent ? "subtle" : $.get(lastSolidMenuAccent);
	}

	var div = root_3();
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
							var node_2 = $.child(div_3);

							MenuIcon(node_2, { class: 'size-4', strokeWidth: 2 });
							$.reset(div_3);
							$.template_effect(() => $.set_text(text, $.get(currentMenu).label));
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

							get sideOffset() {
								return $.get($2);
							},

							get submenu() {
								return submenu();
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root_2();
								var node_4 = $.first_child(fragment_2);

								$.component(node_4, () => Picker.Group, ($$anchor, Picker_Group) => {
									Picker_Group($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_3 = root_1();
											var node_5 = $.first_child(fragment_3);

											$.component(node_5, () => Picker.Label, ($$anchor, Picker_Label) => {
												Picker_Label($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text('Color');

														$.append($$anchor, text_1);
													},
													$$slots: { default: true }
												});
											});

											var node_6 = $.sibling(node_5, 2);

											$.component(node_6, () => Picker.RadioGroup, ($$anchor, Picker_RadioGroup) => {
												Picker_RadioGroup($$anchor, {
													get value() {
														return $.get(colorChoice);
													},
													onValueChange: (value) => setColor(value),
													children: ($$anchor, $$slotProps) => {
														var fragment_4 = root_1();
														var node_7 = $.first_child(fragment_4);

														$.component(node_7, () => Picker.RadioItem, ($$anchor, Picker_RadioItem) => {
															Picker_RadioItem($$anchor, {
																value: 'default',
																get closeOnSelect() {
																	return isMobile.current;
																},

																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_2 = $.text('Default');

																	$.append($$anchor, text_2);
																},
																$$slots: { default: true }
															});
														});

														var node_8 = $.sibling(node_7, 2);

														$.component(node_8, () => Picker.RadioItem, ($$anchor, Picker_RadioItem_1) => {
															Picker_RadioItem_1($$anchor, {
																value: 'inverted',
																get closeOnSelect() {
																	return isMobile.current;
																},

																get disabled() {
																	return $.get(isDark);
																},

																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_3 = $.text('Inverted');

																	$.append($$anchor, text_3);
																},
																$$slots: { default: true }
															});
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

								var node_9 = $.sibling(node_4, 2);

								$.component(node_9, () => Picker.Separator, ($$anchor, Picker_Separator) => {
									Picker_Separator($$anchor, {});
								});

								var node_10 = $.sibling(node_9, 2);

								$.component(node_10, () => Picker.Group, ($$anchor, Picker_Group_1) => {
									Picker_Group_1($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = root_1();
											var node_11 = $.first_child(fragment_5);

											$.component(node_11, () => Picker.Label, ($$anchor, Picker_Label_1) => {
												Picker_Label_1($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_4 = $.text('Appearance');

														$.append($$anchor, text_4);
													},
													$$slots: { default: true }
												});
											});

											var node_12 = $.sibling(node_11, 2);

											$.component(node_12, () => Picker.RadioGroup, ($$anchor, Picker_RadioGroup_1) => {
												Picker_RadioGroup_1($$anchor, {
													get value() {
														return $.get(surfaceChoice);
													},
													onValueChange: (value) => setSurface(value),
													children: ($$anchor, $$slotProps) => {
														var fragment_6 = root_1();
														var node_13 = $.first_child(fragment_6);

														$.component(node_13, () => Picker.RadioItem, ($$anchor, Picker_RadioItem_2) => {
															Picker_RadioItem_2($$anchor, {
																value: 'solid',
																get closeOnSelect() {
																	return isMobile.current;
																},

																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_5 = $.text('Solid');

																	$.append($$anchor, text_5);
																},
																$$slots: { default: true }
															});
														});

														var node_14 = $.sibling(node_13, 2);

														$.component(node_14, () => Picker.RadioItem, ($$anchor, Picker_RadioItem_3) => {
															Picker_RadioItem_3($$anchor, {
																value: 'translucent',
																get closeOnSelect() {
																	return isMobile.current;
																},

																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_6 = $.text('Translucent');

																	$.append($$anchor, text_6);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_6);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_5);
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

	var node_15 = $.sibling(node, 2);

	LockButton(node_15, {
		prop: 'menuColor',
		class: 'absolute top-1/2 right-8 -translate-y-1/2'
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}