import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Select } from "bits-ui";
import Check from "phosphor-svelte/lib/Check";
import Palette from "phosphor-svelte/lib/Palette";
import CaretUpDown from "phosphor-svelte/lib/CaretUpDown";
import CaretDoubleUp from "phosphor-svelte/lib/CaretDoubleUp";
import CaretDoubleDown from "phosphor-svelte/lib/CaretDoubleDown";
import X from "phosphor-svelte/lib/X";

var root = $.from_html(`<div class="rounded-button bg-muted flex shrink-0 items-center gap-0.5 py-0.5 pl-2 pr-1 text-sm"><span class="text-nowrap"> </span> <div role="button" class="text-muted-foreground hover:bg-background/60 hover:text-foreground rounded-sm p-0.5 transition-colors disabled:cursor-not-allowed"><!></div></div>`);
var root_1 = $.from_html(`<span class="text-foreground-alt/50 truncate"> </span>`);
var root_2 = $.from_html(`<div><!></div>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<div class="ml-auto"><!></div>`);
var root_5 = $.from_html(` <!>`, 1);
var root_6 = $.from_html(`<!> <!>`, 1);

export default function Select_demo_custom_value($$anchor, $$props) {
	$.push($$props, true);

	const themes = [
		{ value: "light-monochrome", label: "Light Monochrome" },
		{ value: "dark-green", label: "Dark Green" },
		{ value: "svelte-orange", label: "Svelte Orange" },
		{ value: "punk-pink", label: "Punk Pink" },
		{ value: "ocean-blue", label: "Ocean Blue", disabled: true },
		{ value: "sunset-orange", label: "Sunset Orange" },
		{ value: "sunset-red", label: "Sunset Red" },
		{ value: "forest-green", label: "Forest Green" },
		{
			value: "lavender-purple",
			label: "Lavender Purple",
			disabled: true
		},
		{ value: "mustard-yellow", label: "Mustard Yellow" },
		{ value: "slate-gray", label: "Slate Gray" },
		{ value: "neon-green", label: "Neon Green" },
		{ value: "coral-reef", label: "Coral Reef" },
		{ value: "midnight-blue", label: "Midnight Blue" },
		{ value: "crimson-red", label: "Crimson Red" },
		{ value: "mint-green", label: "Mint Green" },
		{ value: "pastel-pink", label: "Pastel Pink" },
		{ value: "golden-yellow", label: "Golden Yellow" },
		{ value: "deep-purple", label: "Deep Purple" },
		{ value: "turquoise-blue", label: "Turquoise Blue" },
		{ value: "burnt-orange", label: "Burnt Orange" }
	];

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Select.Root, ($$anchor, Select_Root) => {
		Select_Root($$anchor, {
			type: 'multiple',
			get items() {
				return themes;
			},
			allowDeselect: true,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_6();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Select.Trigger, ($$anchor, Select_Trigger) => {
					Select_Trigger($$anchor, {
						class: 'h-input rounded-9px border-border-input bg-background data-placeholder:text-foreground-alt/50 inline-flex w-[296px] touch-none select-none items-center border px-[11px] text-sm transition-colors',
						'aria-label': 'Select a theme',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_3();
							var node_2 = $.first_child(fragment_2);

							Palette(node_2, { class: 'text-muted-foreground mr-[9px] size-6 shrink-0' });

							var node_3 = $.sibling(node_2, 2);

							{
								const child = ($$anchor, $$arg0) => {
									let props = () => ($$arg0?.()).props;
									let selection = () => ($$arg0?.()).selection;
									let placeholder = () => ($$arg0?.()).placeholder;
									let disabled = () => ($$arg0?.()).disabled;
									var div = root_2();

									$.attribute_effect(div, () => ({
										...props(),
										class: 'flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
									}));

									var node_4 = $.child(div);

									{
										var consequent = ($$anchor) => {
											var fragment_3 = $.comment();
											var node_5 = $.first_child(fragment_3);

											$.each(node_5, 17, () => selection().selected, (selectedTheme) => selectedTheme.value, ($$anchor, selectedTheme) => {
												var div_1 = root();
												var span = $.child(div_1);
												var text = $.only_child(span, true);
												var div_2 = $.sibling(span, 2);

												$.set_attribute(div_2, 'tabindex', 0);

												var node_6 = $.child(div_2);

												X(node_6, { class: 'size-3' });
												$.reset(div_2);
												$.reset(div_1);

												$.template_effect(() => {
													$.set_text(text, $.get(selectedTheme).label);
													$.set_attribute(div_2, 'aria-disabled', disabled());
													$.set_attribute(div_2, 'aria-label', `Remove ${$.get(selectedTheme).label ?? ''}`);
												});

												$.delegated('pointerdown', div_2, (e) => e.stopPropagation());
												$.delegated('pointerup', div_2, (e) => e.stopPropagation());

												$.delegated('keydown', div_2, (e) => {
													if (e.key === "Enter" || e.key === " ") {
														e.currentTarget.click();
													}
												});

												$.delegated('click', div_2, (e) => {
													if (disabled()) return;

													e.stopPropagation();
													e.preventDefault();
													selection().setValue(selection().selected.filter((theme) => theme.value !== $.get(selectedTheme).value).map((theme) => theme.value));
												});

												$.append($$anchor, div_1);
											});

											$.append($$anchor, fragment_3);
										};

										var alternate = ($$anchor) => {
											var span_1 = root_1();
											var text_1 = $.only_child(span_1, true);

											$.template_effect(() => $.set_text(text_1, placeholder()));
											$.append($$anchor, span_1);
										};

										$.if(node_4, ($$render) => {
											if (selection().type === "multiple" && selection().selected.length > 0) $$render(consequent); else $$render(alternate, -1);
										});
									}

									$.reset(div);
									$.append($$anchor, div);
								};

								$.component(node_3, () => Select.Value, ($$anchor, Select_Value) => {
									Select_Value($$anchor, {
										placeholder: 'Select your favorite themes',
										child,
										$$slots: { child: true }
									});
								});
							}

							var node_7 = $.sibling(node_3, 2);

							CaretUpDown(node_7, { class: 'text-muted-foreground ml-2 size-6 shrink-0' });
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_8 = $.sibling(node_1, 2);

				$.component(node_8, () => Select.Portal, ($$anchor, Select_Portal) => {
					Select_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_9 = $.first_child(fragment_4);

							$.component(node_9, () => Select.Content, ($$anchor, Select_Content) => {
								Select_Content($$anchor, {
									class: 'focus-override border-muted bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 outline-hidden z-50 h-96 max-h-[var(--bits-select-content-available-height)] w-[var(--bits-select-anchor-width)] min-w-[var(--bits-select-anchor-width)] select-none rounded-xl border px-1 py-3 data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
									sideOffset: 10,
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root_3();
										var node_10 = $.first_child(fragment_5);

										$.component(node_10, () => Select.ScrollUpButton, ($$anchor, Select_ScrollUpButton) => {
											Select_ScrollUpButton($$anchor, {
												class: 'flex w-full items-center justify-center',
												children: ($$anchor, $$slotProps) => {
													CaretDoubleUp($$anchor, { class: 'size-3' });
												},
												$$slots: { default: true }
											});
										});

										var node_11 = $.sibling(node_10, 2);

										$.component(node_11, () => Select.Viewport, ($$anchor, Select_Viewport) => {
											Select_Viewport($$anchor, {
												class: 'p-1',
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = $.comment();
													var node_12 = $.first_child(fragment_7);

													$.each(node_12, 19, () => themes, (theme, i) => i + theme.value, ($$anchor, theme) => {
														var fragment_8 = $.comment();
														var node_13 = $.first_child(fragment_8);

														{
															const children = ($$anchor, $$arg0) => {
																let selected = () => ($$arg0?.()).selected;

																$.next();

																var fragment_9 = root_5();
																var text_2 = $.first_child(fragment_9);
																var node_14 = $.sibling(text_2);

																{
																	var consequent_1 = ($$anchor) => {
																		var div_3 = root_4();
																		var node_15 = $.child(div_3);

																		Check(node_15, { 'aria-label': 'check' });
																		$.reset(div_3);
																		$.append($$anchor, div_3);
																	};

																	$.if(node_14, ($$render) => {
																		if (selected()) $$render(consequent_1);
																	});
																}

																$.template_effect(() => $.set_text(text_2, `${$.get(theme).label ?? ''} `));
																$.append($$anchor, fragment_9);
															};

															$.component(node_13, () => Select.Item, ($$anchor, Select_Item) => {
																Select_Item($$anchor, {
																	class: 'rounded-button data-highlighted:bg-muted outline-hidden data-disabled:opacity-50 flex h-10 w-full select-none items-center py-3 pl-5 pr-1.5 text-sm capitalize',
																	get value() {
																		return $.get(theme).value;
																	},

																	get label() {
																		return $.get(theme).label;
																	},

																	get disabled() {
																		return $.get(theme).disabled;
																	},
																	children,
																	$$slots: { default: true }
																});
															});
														}

														$.append($$anchor, fragment_8);
													});

													$.append($$anchor, fragment_7);
												},
												$$slots: { default: true }
											});
										});

										var node_16 = $.sibling(node_11, 2);

										$.component(node_16, () => Select.ScrollDownButton, ($$anchor, Select_ScrollDownButton) => {
											Select_ScrollDownButton($$anchor, {
												class: 'flex w-full items-center justify-center',
												children: ($$anchor, $$slotProps) => {
													CaretDoubleDown($$anchor, { class: 'size-3' });
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['pointerdown', 'pointerup', 'keydown', 'click']);