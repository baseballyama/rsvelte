import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Combobox } from "bits-ui";
import CaretUpDown from "phosphor-svelte/lib/CaretUpDown";
import Check from "phosphor-svelte/lib/Check";
import OrangeSlice from "phosphor-svelte/lib/OrangeSlice";
import CaretDoubleUp from "phosphor-svelte/lib/CaretDoubleUp";
import CaretDoubleDown from "phosphor-svelte/lib/CaretDoubleDown";
import { cubicOut } from "svelte/easing";

var root = $.from_html(`<div class="ml-auto"><!></div>`);
var root_1 = $.from_html(` <!>`, 1);
var root_2 = $.from_html(`<span class="block px-5 py-2 text-sm text-muted-foreground">No results found, try again.</span>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<div class="relative"><!> <!> <!></div> <!>`, 1);

export default function Combobox_demo_auto_scroll_delay($$anchor, $$props) {
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

	// Duplicate the menu items a couple of times to show off scrolling a big list
	const baseFruits = [...fruits];

	for (let i = 0; i < 10; i++) {
		for (let baseTheme of baseFruits) {
			fruits.push({ ...baseTheme, value: baseTheme.value + i });
		}
	}

	let searchValue = $.state("");

	const filteredFruits = $.derived(() => $.get(searchValue) === ""
		? fruits
		: fruits.filter((fruit) => fruit.label.toLowerCase().includes($.get(searchValue).toLowerCase())));

	function autoScrollDelay(tick) {
		const maxDelay = 200;
		const minDelay = 25;
		const steps = 30;
		const progress = Math.min(tick / steps, 1);

		// Use the cubicOut easing function from svelte/easing
		return maxDelay - (maxDelay - minDelay) * cubicOut(progress);
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Combobox.Root, ($$anchor, Combobox_Root) => {
		Combobox_Root($$anchor, {
			type: 'multiple',
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

							$.component(node_5, () => Combobox.Content, ($$anchor, Combobox_Content) => {
								Combobox_Content($$anchor, {
									class: 'focus-override border-muted bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 outline-hidden z-50 h-96 max-h-[var(--bits-combobox-content-available-height)] w-[var(--bits-combobox-anchor-width)] min-w-[var(--bits-combobox-anchor-width)] select-none rounded-xl border px-1 py-3 data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
									sideOffset: 10,
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_3();
										var node_6 = $.first_child(fragment_4);

										$.component(node_6, () => Combobox.ScrollUpButton, ($$anchor, Combobox_ScrollUpButton) => {
											Combobox_ScrollUpButton($$anchor, {
												class: 'flex w-full items-center justify-center py-1',
												delay: autoScrollDelay,
												children: ($$anchor, $$slotProps) => {
													CaretDoubleUp($$anchor, { class: 'size-3' });
												},
												$$slots: { default: true }
											});
										});

										var node_7 = $.sibling(node_6, 2);

										$.component(node_7, () => Combobox.Viewport, ($$anchor, Combobox_Viewport) => {
											Combobox_Viewport($$anchor, {
												class: 'p-1',
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = $.comment();
													var node_8 = $.first_child(fragment_6);

													$.each(
														node_8,
														19,
														() => $.get(filteredFruits),
														(fruit, i) => i + fruit.value,
														($$anchor, fruit) => {
															var fragment_7 = $.comment();
															var node_9 = $.first_child(fragment_7);

															{
																const children = ($$anchor, $$arg0) => {
																	let selected = () => ($$arg0?.()).selected;

																	$.next();

																	var fragment_8 = root_1();
																	var text = $.first_child(fragment_8);
																	var node_10 = $.sibling(text);

																	{
																		var consequent = ($$anchor) => {
																			var div_1 = root();
																			var node_11 = $.child(div_1);

																			Check(node_11, {});
																			$.reset(div_1);
																			$.append($$anchor, div_1);
																		};

																		$.if(node_10, ($$render) => {
																			if (selected()) $$render(consequent);
																		});
																	}

																	$.template_effect(() => $.set_text(text, `${$.get(fruit).label ?? ''} `));
																	$.append($$anchor, fragment_8);
																};

																$.component(node_9, () => Combobox.Item, ($$anchor, Combobox_Item) => {
																	Combobox_Item($$anchor, {
																		class: 'rounded-button data-highlighted:bg-muted outline-hidden flex h-10 w-full select-none items-center py-3 pl-5 pr-1.5 text-sm capitalize',
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

										var node_12 = $.sibling(node_7, 2);

										$.component(node_12, () => Combobox.ScrollDownButton, ($$anchor, Combobox_ScrollDownButton) => {
											Combobox_ScrollDownButton($$anchor, {
												class: 'flex w-full items-center justify-center py-1',
												delay: autoScrollDelay,
												children: ($$anchor, $$slotProps) => {
													CaretDoubleDown($$anchor, { class: 'size-3' });
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

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}