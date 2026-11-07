import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Combobox } from "bits-ui";
import CaretUpDown from "phosphor-svelte/lib/CaretUpDown";
import Check from "phosphor-svelte/lib/Check";
import OrangeSlice from "phosphor-svelte/lib/OrangeSlice";
import CaretDoubleUp from "phosphor-svelte/lib/CaretDoubleUp";
import CaretDoubleDown from "phosphor-svelte/lib/CaretDoubleDown";
import { fly } from "svelte/transition";

var root = $.from_html(`<div class="ml-auto"><!></div>`);
var root_1 = $.from_html(` <!>`, 1);
var root_2 = $.from_html(`<span class="block px-5 py-2 text-sm text-muted-foreground">No results found, try again.</span>`);
var root_3 = $.from_html(`<div><div><!> <!> <!></div></div>`);
var root_4 = $.from_html(`<div class="relative"><!> <!> <!></div> <!>`, 1);

export default function Combobox_demo_transition($$anchor, $$props) {
	$.push($$props, true);

	const fruits = [
		{ value: "mango", label: "Mango" },
		{ value: "watermelon", label: "Watermelon" },
		{ value: "apple", label: "Apple" },
		{ value: "pineapple", label: "Pineapple" },
		{ value: "orange", label: "Orange" },
		{ value: "grape", label: "Grape" },
		{ value: "strawberry", label: "Strawberry" },
		{ value: "banana", label: "Banana" },
		{ value: "kiwi", label: "Kiwi" },
		{ value: "peach", label: "Peach" },
		{ value: "cherry", label: "Cherry" },
		{ value: "blueberry", label: "Blueberry" },
		{ value: "raspberry", label: "Raspberry" },
		{ value: "blackberry", label: "Blackberry" },
		{ value: "plum", label: "Plum" },
		{ value: "apricot", label: "Apricot" },
		{ value: "pear", label: "Pear" },
		{ value: "grapefruit", label: "Grapefruit" }
	];

	let searchValue = $.state("");

	const filteredFruits = $.derived(() => $.get(searchValue) === ""
		? fruits
		: fruits.filter((fruit) => fruit.label.toLowerCase().includes($.get(searchValue).toLowerCase())));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Combobox.Root, ($$anchor, Combobox_Root) => {
		Combobox_Root($$anchor, {
			type: 'single',
			name: 'favoriteFruit',
			onOpenChangeComplete: (o) => {
				if (!o) $.set(searchValue, "");
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_4();
				var div = $.first_child(fragment_1);
				var node_1 = $.child(div);

				OrangeSlice(node_1, {
					class: 'text-muted-foreground absolute start-3 top-1/2 size-6 -translate-y-1/2'
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Combobox.Input, ($$anchor, Combobox_Input) => {
					Combobox_Input($$anchor, {
						oninput: (e) => $.set(searchValue, e.currentTarget.value, true),
						class: 'h-input rounded-9px border-border-input bg-background placeholder:text-foreground-alt/50 focus:ring-foreground focus:ring-offset-background focus:outline-hidden inline-flex w-[296px] truncate border px-11 text-base transition-colors focus:ring-2 focus:ring-offset-2 sm:text-sm',
						placeholder: 'Search a fruit',
						'aria-label': 'Search a fruit'
					});
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => Combobox.Trigger, ($$anchor, Combobox_Trigger) => {
					Combobox_Trigger($$anchor, {
						class: 'absolute end-3 top-1/2 size-6 -translate-y-1/2',
						children: ($$anchor, $$slotProps) => {
							CaretUpDown($$anchor, { class: 'text-muted-foreground size-6' });
						},
						$$slots: { default: true }
					});
				});

				$.reset(div);

				var node_4 = $.sibling(div, 2);

				$.component(node_4, () => Combobox.Portal, ($$anchor, Combobox_Portal) => {
					Combobox_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_5 = $.first_child(fragment_3);

							{
								const child = ($$anchor, $$arg0) => {
									let wrapperProps = () => ($$arg0?.()).wrapperProps;
									let props = () => ($$arg0?.()).props;
									let open = () => ($$arg0?.()).open;
									var fragment_4 = $.comment();
									var node_6 = $.first_child(fragment_4);

									{
										var consequent_1 = ($$anchor) => {
											var div_1 = root_3();

											$.attribute_effect(div_1, () => ({ ...wrapperProps() }));

											var div_2 = $.child(div_1);

											$.attribute_effect(div_2, () => ({ ...props() }));

											var node_7 = $.child(div_2);

											$.component(node_7, () => Combobox.ScrollUpButton, ($$anchor, Combobox_ScrollUpButton) => {
												Combobox_ScrollUpButton($$anchor, {
													class: 'flex w-full items-center justify-center',
													children: ($$anchor, $$slotProps) => {
														CaretDoubleUp($$anchor, { class: 'size-3' });
													},
													$$slots: { default: true }
												});
											});

											var node_8 = $.sibling(node_7, 2);

											$.component(node_8, () => Combobox.Viewport, ($$anchor, Combobox_Viewport) => {
												Combobox_Viewport($$anchor, {
													class: 'p-1',
													children: ($$anchor, $$slotProps) => {
														var fragment_6 = $.comment();
														var node_9 = $.first_child(fragment_6);

														$.each(
															node_9,
															19,
															() => $.get(filteredFruits),
															(fruit, i) => i + fruit.value,
															($$anchor, fruit) => {
																var fragment_7 = $.comment();
																var node_10 = $.first_child(fragment_7);

																{
																	const children = ($$anchor, $$arg0) => {
																		let selected = () => ($$arg0?.()).selected;

																		$.next();

																		var fragment_8 = root_1();
																		var text = $.first_child(fragment_8);
																		var node_11 = $.sibling(text);

																		{
																			var consequent = ($$anchor) => {
																				var div_3 = root();
																				var node_12 = $.child(div_3);

																				Check(node_12, {});
																				$.reset(div_3);
																				$.append($$anchor, div_3);
																			};

																			$.if(node_11, ($$render) => {
																				if (selected()) $$render(consequent);
																			});
																		}

																		$.template_effect(() => $.set_text(text, `${$.get(fruit).label ?? ''} `));
																		$.append($$anchor, fragment_8);
																	};

																	$.component(node_10, () => Combobox.Item, ($$anchor, Combobox_Item) => {
																		Combobox_Item($$anchor, {
																			class: 'rounded-button data-highlighted:bg-muted outline-hidden flex h-10 w-full select-none items-center py-3 pl-5 pr-1.5 text-sm  capitalize',
																			get value() {
																				return $.get(fruit).value;
																			},

																			get label() {
																				return $.get(fruit).label;
																			},
																			children,
																			$$slots: { default: true }
																		});
																	});
																}

																$.append($$anchor, fragment_7);
															},
															($$anchor) => {
																var span = root_2();

																$.append($$anchor, span);
															}
														);

														$.append($$anchor, fragment_6);
													},
													$$slots: { default: true }
												});
											});

											var node_13 = $.sibling(node_8, 2);

											$.component(node_13, () => Combobox.ScrollDownButton, ($$anchor, Combobox_ScrollDownButton) => {
												Combobox_ScrollDownButton($$anchor, {
													class: 'flex w-full items-center justify-center',
													children: ($$anchor, $$slotProps) => {
														CaretDoubleDown($$anchor, { class: 'size-3' });
													},
													$$slots: { default: true }
												});
											});

											$.reset(div_2);
											$.reset(div_1);
											$.transition(3, div_2, () => fly, () => ({ duration: 300 }));
											$.append($$anchor, div_1);
										};

										$.if(node_6, ($$render) => {
											if (open()) $$render(consequent_1);
										});
									}

									$.append($$anchor, fragment_4);
								};

								$.component(node_5, () => Combobox.Content, ($$anchor, Combobox_Content) => {
									Combobox_Content($$anchor, {
										class: 'border-muted bg-background shadow-popover outline-hidden h-96 max-h-[var(--bits-combobox-content-available-height)] w-[var(--bits-combobox-anchor-width)] min-w-[var(--bits-combobox-anchor-width)] rounded-xl border px-1 py-3',
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
	$.pop();
}