import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SquareTerminal from "@lucide/svelte/icons/square-terminal";
import * as Card from "$lib/registry/ui/card/index.js";
import * as FieldGroup from "$lib/registry/ui/field/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import Cta from "$lib/components/cta.svelte";
import Ethical from "$lib/components/ethical.svelte";
import Separator from "$lib/registry/ui/separator/separator.svelte";
import { FONT_HEADING_OPTIONS, FONTS } from "$lib/fonts.js";
import { Button } from "$lib/registry/ui/button/index.js";
import BaseColorPicker from "./base-color-picker.svelte";
import ChartColorPicker from "./chart-color-picker.svelte";
import CopyPreset from "./copy-preset.svelte";
import FontPicker from "./font-picker.svelte";
import IconLibraryPicker from "./icon-library-picker.svelte";
import MainMenu from "./main-menu.svelte";
import MenuAccentPicker from "./menu-accent-picker.svelte";
import MenuColorPicker from "./menu-color-picker.svelte";
import OpenPreset from "./open-preset.svelte";
import RadiusPicker from "./radius-picker.svelte";
import RandomButton from "./random-button.svelte";
import StylePicker from "./style-picker.svelte";
import ThemePicker from "./theme-picker.svelte";
import { InitializeProjectCtx } from "./initialize-project-context.svelte.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> Initialize Project`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_5 = $.from_html(`<div class="top-24 right-12 isolate z-10 flex min-h-0 w-full flex-col gap-2 self-start md:w-(--customizer-width)"><!> <div class="hidden w-full flex-1 flex-col gap-12 md:flex"><!></div> <div class="hidden flex-col gap-12 md:flex"><!></div></div>`);

export default function Customizer($$anchor, $$props) {
	$.push($$props, true);

	const initializeProjectCtx = InitializeProjectCtx.get();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Tooltip.Provider, ($$anchor, Tooltip_Provider) => {
		Tooltip_Provider($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var div = root_5();
				var node_1 = $.child(div);

				$.component(node_1, () => Card.Root, ($$anchor, Card_Root) => {
					Card_Root($$anchor, {
						class: 'dark max-h-(--preview-height) min-h-0 w-full gap-0 rounded-2xl bg-card/90 shadow-xl backdrop-blur-xl',
						size: 'sm',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_4();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Card.Header, ($$anchor, Card_Header) => {
								Card_Header($$anchor, {
									class: 'hidden items-center justify-between gap-2 border-b px-3! group-data-reversed/layout:flex-row-reverse md:flex',
									children: ($$anchor, $$slotProps) => {
										MainMenu($$anchor, {});
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Card.Content, ($$anchor, Card_Content) => {
								Card_Content($$anchor, {
									class: 'no-scrollbar min-h-0 flex-1 overflow-x-auto overflow-y-hidden p-0 md:overflow-y-auto',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_2();
										var node_4 = $.first_child(fragment_3);

										$.component(node_4, () => FieldGroup.Group, ($$anchor, FieldGroup_Group) => {
											FieldGroup_Group($$anchor, {
												class: 'flex-row gap-2.5 p-3 md:flex-col md:gap-3.25',
												children: ($$anchor, $$slotProps) => {
													StylePicker($$anchor, {});
												},
												$$slots: { default: true }
											});
										});

										var node_5 = $.sibling(node_4, 2);

										Separator(node_5, {});

										var node_6 = $.sibling(node_5, 2);

										$.component(node_6, () => FieldGroup.Group, ($$anchor, FieldGroup_Group_1) => {
											FieldGroup_Group_1($$anchor, {
												class: 'flex-row gap-2.5 p-3 md:flex-col md:gap-3.25',
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_7 = $.first_child(fragment_5);

													BaseColorPicker(node_7, {});

													var node_8 = $.sibling(node_7, 2);

													ThemePicker(node_8, {});

													var node_9 = $.sibling(node_8, 2);

													ChartColorPicker(node_9, {});
													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										var node_10 = $.sibling(node_6, 2);

										Separator(node_10, {});

										var node_11 = $.sibling(node_10, 2);

										$.component(node_11, () => FieldGroup.Group, ($$anchor, FieldGroup_Group_2) => {
											FieldGroup_Group_2($$anchor, {
												class: 'flex-row gap-2.5 p-3 md:flex-col md:gap-3.25',
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root_1();
													var node_12 = $.first_child(fragment_6);

													FontPicker(node_12, {
														label: 'Heading',
														param: 'fontHeading',
														get fonts() {
															return FONT_HEADING_OPTIONS;
														}
													});

													var node_13 = $.sibling(node_12, 2);

													FontPicker(node_13, {
														label: 'Font',
														param: 'font',
														get fonts() {
															return FONTS;
														}
													});

													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											});
										});

										var node_14 = $.sibling(node_11, 2);

										Separator(node_14, {});

										var node_15 = $.sibling(node_14, 2);

										$.component(node_15, () => FieldGroup.Group, ($$anchor, FieldGroup_Group_3) => {
											FieldGroup_Group_3($$anchor, {
												class: 'flex-row gap-2.5 p-3 md:flex-col md:gap-3.25',
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = root_1();
													var node_16 = $.first_child(fragment_7);

													IconLibraryPicker(node_16, {});

													var node_17 = $.sibling(node_16, 2);

													RadiusPicker(node_17, {});
													$.append($$anchor, fragment_7);
												},
												$$slots: { default: true }
											});
										});

										var node_18 = $.sibling(node_15, 2);

										Separator(node_18, {});

										var node_19 = $.sibling(node_18, 2);

										$.component(node_19, () => FieldGroup.Group, ($$anchor, FieldGroup_Group_4) => {
											FieldGroup_Group_4($$anchor, {
												class: 'flex-row gap-2.5 p-3 md:flex-col md:gap-3.25',
												children: ($$anchor, $$slotProps) => {
													var fragment_8 = root_1();
													var node_20 = $.first_child(fragment_8);

													MenuColorPicker(node_20, {});

													var node_21 = $.sibling(node_20, 2);

													MenuAccentPicker(node_21, {});
													$.append($$anchor, fragment_8);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_22 = $.sibling(node_3, 2);

							$.component(node_22, () => Card.Footer, ($$anchor, Card_Footer) => {
								Card_Footer($$anchor, {
									class: 'flex min-w-0 gap-2 px-3! md:flex-col md:**:[button,a]:w-full',
									children: ($$anchor, $$slotProps) => {
										var fragment_9 = root();
										var node_23 = $.first_child(fragment_9);

										CopyPreset(node_23, { class: 'flex-1 md:flex-none' });

										var node_24 = $.sibling(node_23, 2);

										OpenPreset(node_24, { class: 'max-w-20 min-w-0 flex-1 sm:max-w-none md:flex-none' });

										var node_25 = $.sibling(node_24, 2);

										RandomButton(node_25, {});
										$.append($$anchor, fragment_9);
									},
									$$slots: { default: true }
								});
							});

							var node_26 = $.sibling(node_22, 2);

							$.component(node_26, () => Card.Footer, ($$anchor, Card_Footer_1) => {
								Card_Footer_1($$anchor, {
									class: 'flex min-w-0 gap-2 px-3! pt-2 md:flex-col md:**:[button,a]:w-full',
									children: ($$anchor, $$slotProps) => {
										Button($$anchor, {
											variant: 'default',
											onclick: () => initializeProjectCtx.open = true,
											children: ($$anchor, $$slotProps) => {
												var fragment_11 = root_3();
												var node_27 = $.first_child(fragment_11);

												SquareTerminal(node_27, {});
												$.next();
												$.append($$anchor, fragment_11);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var div_1 = $.sibling(node_1, 2);
				var node_28 = $.child(div_1);

				Cta(node_28, {});
				$.reset(div_1);

				var div_2 = $.sibling(div_1, 2);
				var node_29 = $.child(div_2);

				Ethical(node_29, {});
				$.reset(div_2);
				$.reset(div);
				$.append($$anchor, div);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}