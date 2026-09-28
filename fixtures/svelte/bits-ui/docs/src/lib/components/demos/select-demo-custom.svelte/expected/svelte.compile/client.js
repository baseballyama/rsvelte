import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Select } from "bits-ui";
import Check from "phosphor-svelte/lib/Check";
import Palette from "phosphor-svelte/lib/Palette";
import CaretUpDown from "phosphor-svelte/lib/CaretUpDown";
import CaretDoubleUp from "phosphor-svelte/lib/CaretDoubleUp";
import CaretDoubleDown from "phosphor-svelte/lib/CaretDoubleDown";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'value', 'contentProps']);
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="ml-auto"><!></div>`);
var root_2 = $.from_html(` <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Select_demo_custom($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15, ""),
		restProps = $.rest_props($$props, rest_excludes);

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
		Select_Root($$anchor, $.spread_props(() => restProps, {
			type: 'single',
			get items() {
				return themes;
			},

			get value() {
				return value();
			},

			set value($$value) {
				value($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_3();
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

							$.component(node_6, () => Select.Content, ($$anchor, Select_Content) => {
								Select_Content($$anchor, $.spread_props(
									{
										class: 'focus-override border-muted bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 outline-hidden z-50 h-96 max-h-[var(--bits-select-content-available-height)] w-[var(--bits-select-anchor-width)] min-w-[var(--bits-select-anchor-width)] select-none rounded-xl border px-1 py-3 data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
										sideOffset: 10
									},
									() => $$props.contentProps,
									{
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root();
											var node_7 = $.first_child(fragment_4);

											$.component(node_7, () => Select.ScrollUpButton, ($$anchor, Select_ScrollUpButton) => {
												Select_ScrollUpButton($$anchor, {
													class: 'flex w-full items-center justify-center',
													children: ($$anchor, $$slotProps) => {
														CaretDoubleUp($$anchor, { class: 'size-3' });
													},
													$$slots: { default: true }
												});
											});

											var node_8 = $.sibling(node_7, 2);

											$.component(node_8, () => Select.Viewport, ($$anchor, Select_Viewport) => {
												Select_Viewport($$anchor, {
													class: 'p-1',
													children: ($$anchor, $$slotProps) => {
														var fragment_6 = $.comment();
														var node_9 = $.first_child(fragment_6);

														$.each(node_9, 19, () => themes, (theme, i) => i + theme.value, ($$anchor, theme) => {
															var fragment_7 = $.comment();
															var node_10 = $.first_child(fragment_7);

															{
																const children = ($$anchor, $$arg0) => {
																	let selected = () => ($$arg0?.()).selected;

																	$.next();

																	var fragment_8 = root_2();
																	var text = $.first_child(fragment_8);
																	var node_11 = $.sibling(text);

																	{
																		var consequent = ($$anchor) => {
																			var div = root_1();
																			var node_12 = $.child(div);

																			Check(node_12, {});
																			$.reset(div);
																			$.append($$anchor, div);
																		};

																		$.if(node_11, ($$render) => {
																			if (selected()) $$render(consequent);
																		});
																	}

																	$.template_effect(() => $.set_text(text, `${$.get(theme).label ?? ''} `));
																	$.append($$anchor, fragment_8);
																};

																$.component(node_10, () => Select.Item, ($$anchor, Select_Item) => {
																	Select_Item($$anchor, {
																		class: 'rounded-button data-highlighted:bg-muted outline-hidden flex h-10 w-full select-none items-center py-3 pl-5 pr-1.5 text-sm capitalize',
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

											var node_13 = $.sibling(node_8, 2);

											$.component(node_13, () => Select.ScrollDownButton, ($$anchor, Select_ScrollDownButton) => {
												Select_ScrollDownButton($$anchor, {
													class: 'flex w-full items-center justify-center',
													children: ($$anchor, $$slotProps) => {
														CaretDoubleDown($$anchor, { class: 'size-3' });
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									}
								));
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}));
	});

	$.append($$anchor, fragment);
	$.pop();
}