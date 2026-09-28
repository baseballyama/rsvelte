import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Select } from "bits-ui";
import Check from "phosphor-svelte/lib/Check";
import Palette from "phosphor-svelte/lib/Palette";
import CaretUpDown from "phosphor-svelte/lib/CaretUpDown";
import CaretDoubleUp from "phosphor-svelte/lib/CaretDoubleUp";
import CaretDoubleDown from "phosphor-svelte/lib/CaretDoubleDown";
import { fly } from "svelte/transition";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="ml-auto"><!></div>`);
var root_2 = $.from_html(` <!>`, 1);
var root_3 = $.from_html(`<div><div><!> <!> <!></div></div>`);
var root_4 = $.from_html(`<!> <!>`, 1);

export default function Select_demo_transition($$anchor) {
	const themes = [
		{ value: "light-monochrome", label: "Light Monochrome" },
		{ value: "dark-green", label: "Dark Green" },
		{ value: "svelte-orange", label: "Svelte Orange" },
		{ value: "punk-pink", label: "Punk Pink" },
		{ value: "ocean-blue", label: "Ocean Blue" },
		{ value: "sunset-red", label: "Sunset Red" },
		{ value: "forest-green", label: "Forest Green" },
		{ value: "lavender-purple", label: "Lavender Purple" },
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
			type: 'single',
			get items() {
				return themes;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_4();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Select.Trigger, ($$anchor, Select_Trigger) => {
					Select_Trigger($$anchor, {
						class: 'h-input rounded-9px border-border-input bg-background placeholder:text-foreground-alt/50 inline-flex w-[296px] touch-none select-none items-center border px-[11px] text-sm transition-colors',
						'aria-label': 'Select a theme',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							Palette(node_2, { class: 'text-muted-foreground mr-[9px] size-6' });

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Select.Value, ($$anchor, Select_Value) => {
								Select_Value($$anchor, { placeholder: 'Select a theme' });
							});

							var node_4 = $.sibling(node_3, 2);

							CaretUpDown(node_4, { class: 'text-muted-foreground ml-auto size-6' });
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_1, 2);

				$.component(node_5, () => Select.Portal, ($$anchor, Select_Portal) => {
					Select_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_6 = $.first_child(fragment_3);

							{
								const child = ($$anchor, $$arg0) => {
									let wrapperProps = () => ($$arg0?.()).wrapperProps;
									let props = () => ($$arg0?.()).props;
									let open = () => ($$arg0?.()).open;
									var fragment_4 = $.comment();
									var node_7 = $.first_child(fragment_4);

									{
										var consequent_1 = ($$anchor) => {
											var div = root_3();

											$.attribute_effect(div, () => ({ ...wrapperProps() }));

											var div_1 = $.child(div);

											$.attribute_effect(div_1, () => ({ ...props() }));

											var node_8 = $.child(div_1);

											$.component(node_8, () => Select.ScrollUpButton, ($$anchor, Select_ScrollUpButton) => {
												Select_ScrollUpButton($$anchor, {
													class: 'flex w-full items-center justify-center',
													children: ($$anchor, $$slotProps) => {
														CaretDoubleUp($$anchor, { class: 'size-3' });
													},
													$$slots: { default: true }
												});
											});

											var node_9 = $.sibling(node_8, 2);

											$.component(node_9, () => Select.Viewport, ($$anchor, Select_Viewport) => {
												Select_Viewport($$anchor, {
													class: 'p-1',
													children: ($$anchor, $$slotProps) => {
														var fragment_6 = $.comment();
														var node_10 = $.first_child(fragment_6);

														$.each(node_10, 19, () => themes, (theme, i) => i + theme.value, ($$anchor, theme) => {
															var fragment_7 = $.comment();
															var node_11 = $.first_child(fragment_7);

															{
																const children = ($$anchor, $$arg0) => {
																	let selected = () => ($$arg0?.()).selected;

																	$.next();

																	var fragment_8 = root_2();
																	var text = $.first_child(fragment_8);
																	var node_12 = $.sibling(text);

																	{
																		var consequent = ($$anchor) => {
																			var div_2 = root_1();
																			var node_13 = $.child(div_2);

																			Check(node_13, {});
																			$.reset(div_2);
																			$.append($$anchor, div_2);
																		};

																		$.if(node_12, ($$render) => {
																			if (selected()) $$render(consequent);
																		});
																	}

																	$.template_effect(() => $.set_text(text, `${$.get(theme).label ?? ''} `));
																	$.append($$anchor, fragment_8);
																};

																$.component(node_11, () => Select.Item, ($$anchor, Select_Item) => {
																	Select_Item($$anchor, {
																		class: 'rounded-button data-highlighted:bg-muted outline-hidden flex h-10 w-full select-none items-center py-3 pl-5 pr-1.5 text-sm capitalize duration-75',
																		get value() {
																			return $.get(theme).value;
																		},

																		get label() {
																			return $.get(theme).label;
																		},
																		children,
																		$$slots: { default: true }
																	});
																});
															}

															$.append($$anchor, fragment_7);
														});

														$.append($$anchor, fragment_6);
													},
													$$slots: { default: true }
												});
											});

											var node_14 = $.sibling(node_9, 2);

											$.component(node_14, () => Select.ScrollDownButton, ($$anchor, Select_ScrollDownButton) => {
												Select_ScrollDownButton($$anchor, {
													class: 'flex w-full items-center justify-center',
													children: ($$anchor, $$slotProps) => {
														CaretDoubleDown($$anchor, { class: 'size-3' });
													},
													$$slots: { default: true }
												});
											});

											$.reset(div_1);
											$.reset(div);
											$.transition(3, div_1, () => fly, () => ({ duration: 300 }));
											$.append($$anchor, div);
										};

										$.if(node_7, ($$render) => {
											if (open()) $$render(consequent_1);
										});
									}

									$.append($$anchor, fragment_4);
								};

								$.component(node_6, () => Select.Content, ($$anchor, Select_Content) => {
									Select_Content($$anchor, {
										class: 'focus-override border-muted bg-background shadow-popover outline-hidden z-50 h-96 max-h-[var(--bits-select-content-available-height)] w-[var(--bits-select-anchor-width)] min-w-[var(--bits-select-anchor-width)] select-none rounded-xl border px-1 py-3',
										sideOffset: 10,
										forceMount: true,
										child,
										$$slots: { child: true }
									});
								});
							}

							$.append($$anchor, fragment_3);
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
}