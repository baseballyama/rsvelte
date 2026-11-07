import * as $ from 'svelte/internal/server';
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

export default function Customizer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const initializeProjectCtx = InitializeProjectCtx.get();

		if (Tooltip.Provider) {
			$$renderer.push('<!--[-->');

			Tooltip.Provider($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="top-24 right-12 isolate z-10 flex min-h-0 w-full flex-col gap-2 self-start md:w-(--customizer-width)">`);

					if (Card.Root) {
						$$renderer.push('<!--[-->');

						Card.Root($$renderer, {
							class: 'dark max-h-(--preview-height) min-h-0 w-full gap-0 rounded-2xl bg-card/90 shadow-xl backdrop-blur-xl',
							size: 'sm',
							children: ($$renderer) => {
								if (Card.Header) {
									$$renderer.push('<!--[-->');

									Card.Header($$renderer, {
										class: 'hidden items-center justify-between gap-2 border-b px-3! group-data-reversed/layout:flex-row-reverse md:flex',
										children: ($$renderer) => {
											MainMenu($$renderer, {});
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Card.Content) {
									$$renderer.push('<!--[-->');

									Card.Content($$renderer, {
										class: 'no-scrollbar min-h-0 flex-1 overflow-x-auto overflow-y-hidden p-0 md:overflow-y-auto',
										children: ($$renderer) => {
											if (FieldGroup.Group) {
												$$renderer.push('<!--[-->');

												FieldGroup.Group($$renderer, {
													class: 'flex-row gap-2.5 p-3 md:flex-col md:gap-3.25',
													children: ($$renderer) => {
														StylePicker($$renderer, {});
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);
											Separator($$renderer, {});
											$$renderer.push(`<!----> `);

											if (FieldGroup.Group) {
												$$renderer.push('<!--[-->');

												FieldGroup.Group($$renderer, {
													class: 'flex-row gap-2.5 p-3 md:flex-col md:gap-3.25',
													children: ($$renderer) => {
														BaseColorPicker($$renderer, {});
														$$renderer.push(`<!----> `);
														ThemePicker($$renderer, {});
														$$renderer.push(`<!----> `);
														ChartColorPicker($$renderer, {});
														$$renderer.push(`<!---->`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);
											Separator($$renderer, {});
											$$renderer.push(`<!----> `);

											if (FieldGroup.Group) {
												$$renderer.push('<!--[-->');

												FieldGroup.Group($$renderer, {
													class: 'flex-row gap-2.5 p-3 md:flex-col md:gap-3.25',
													children: ($$renderer) => {
														FontPicker($$renderer, {
															label: 'Heading',
															param: 'fontHeading',
															fonts: FONT_HEADING_OPTIONS
														});

														$$renderer.push(`<!----> `);
														FontPicker($$renderer, { label: 'Font', param: 'font', fonts: FONTS });
														$$renderer.push(`<!---->`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);
											Separator($$renderer, {});
											$$renderer.push(`<!----> `);

											if (FieldGroup.Group) {
												$$renderer.push('<!--[-->');

												FieldGroup.Group($$renderer, {
													class: 'flex-row gap-2.5 p-3 md:flex-col md:gap-3.25',
													children: ($$renderer) => {
														IconLibraryPicker($$renderer, {});
														$$renderer.push(`<!----> `);
														RadiusPicker($$renderer, {});
														$$renderer.push(`<!---->`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);
											Separator($$renderer, {});
											$$renderer.push(`<!----> `);

											if (FieldGroup.Group) {
												$$renderer.push('<!--[-->');

												FieldGroup.Group($$renderer, {
													class: 'flex-row gap-2.5 p-3 md:flex-col md:gap-3.25',
													children: ($$renderer) => {
														MenuColorPicker($$renderer, {});
														$$renderer.push(`<!----> `);
														MenuAccentPicker($$renderer, {});
														$$renderer.push(`<!---->`);
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

								if (Card.Footer) {
									$$renderer.push('<!--[-->');

									Card.Footer($$renderer, {
										class: 'flex min-w-0 gap-2 px-3! md:flex-col md:**:[button,a]:w-full',
										children: ($$renderer) => {
											CopyPreset($$renderer, { class: 'flex-1 md:flex-none' });
											$$renderer.push(`<!----> `);
											OpenPreset($$renderer, { class: 'max-w-20 min-w-0 flex-1 sm:max-w-none md:flex-none' });
											$$renderer.push(`<!----> `);
											RandomButton($$renderer, {});
											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Card.Footer) {
									$$renderer.push('<!--[-->');

									Card.Footer($$renderer, {
										class: 'flex min-w-0 gap-2 px-3! pt-2 md:flex-col md:**:[button,a]:w-full',
										children: ($$renderer) => {
											Button($$renderer, {
												variant: 'default',
												onclick: () => initializeProjectCtx.open = true,
												children: ($$renderer) => {
													SquareTerminal($$renderer, {});
													$$renderer.push(`<!----> Initialize Project`);
												},
												$$slots: { default: true }
											});
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

					$$renderer.push(` <div class="hidden w-full flex-1 flex-col gap-12 md:flex">`);
					Cta($$renderer, {});
					$$renderer.push(`<!----></div> <div class="hidden flex-col gap-12 md:flex">`);
					Ethical($$renderer, {});
					$$renderer.push(`<!----></div></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}