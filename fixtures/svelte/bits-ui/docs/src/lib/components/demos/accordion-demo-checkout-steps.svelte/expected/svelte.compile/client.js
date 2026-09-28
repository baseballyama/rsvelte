import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils/styles.js";
import { Accordion, useId, Button } from "bits-ui";
import CaretDown from "phosphor-svelte/lib/CaretDown";
import { SvelteSet } from "svelte/reactivity";

const InputField = ($$anchor, $$arg0) => {
	let label = () => ($$arg0?.()).label;
	let placeholder = () => ($$arg0?.()).placeholder;
	let type = $.derived_safe_equal(() => $.fallback(($$arg0?.()).type, "text"));
	const id = $.derived(useId);
	var div_1 = root_1();
	var label_1 = $.child(div_1);
	var text_2 = $.only_child(label_1, true);
	var input = $.sibling(label_1, 2);

	$.reset(div_1);

	$.template_effect(() => {
		$.set_attribute(label_1, 'for', $.get(id));
		$.set_text(text_2, label());
		$.set_attribute(input, 'type', $.get(type));
		$.set_attribute(input, 'id', $.get(id));
		$.set_attribute(input, 'name', label());
		$.set_attribute(input, 'placeholder', placeholder());
	});

	$.append($$anchor, div_1);
};

var root = $.from_html(`<div> </div> <span class="w-full text-left"> </span> <span class="hover:bg-dark-10 inline-flex size-8 items-center justify-center rounded-[7px] bg-transparent"><!></span>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col gap-1"><label class="select-none text-sm font-medium"> </label> <input class="rounded-card-sm border-border-input bg-background placeholder:text-foreground-alt/50 hover:border-dark-40 focus-override inline-flex h-10 w-full items-center border px-4 text-base sm:text-sm"/></div>`);
var root_2 = $.from_html(`<div class="flex flex-col gap-4 pb-6 pt-2"><div class="grid grid-cols-2 gap-4"><!> <!> <div class="col-span-2"><!></div> <!> <!></div> <div class="pt-2"><!></div></div>`);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<div class="flex flex-col gap-4 pb-6 pt-2"><div class="grid grid-cols-3 gap-4"><div class="col-span-3"><!></div> <!> <!> <!></div> <div class="pt-2"><!></div></div>`);
var root_5 = $.from_html(`<div class="flex flex-col gap-4 pt-2"><div class="rounded-lg border p-4"><h4 class="mb-2 font-medium">Order Summary</h4> <div class="flex flex-col gap-2"><div class="flex justify-between text-sm"><span class="text-muted-foreground">Product 1</span> <span>$29.99</span></div> <div class="flex justify-between text-sm"><span class="text-muted-foreground">Product 2</span> <span>$49.99</span></div> <div class="flex justify-between text-sm"><span class="text-muted-foreground">Shipping</span> <span>$4.99</span></div> <div class="mt-2 flex justify-between border-t pt-2 font-medium"><span>Total</span> <span>$84.97</span></div></div></div> <div class="pt-2"><!></div></div>`);
var root_6 = $.from_html(`<!> <!> <!>`, 1);

export default function Accordion_demo_checkout_steps($$anchor, $$props) {
	$.push($$props, true);

	const MyAccordionHeader = ($$anchor, $$arg0) => {
		let value = () => ($$arg0?.()).value;
		let title = () => ($$arg0?.()).title;
		const isCompleted = $.derived(() => completedSteps.has(value()));
		var fragment = $.comment();
		var node = $.first_child(fragment);

		$.component(node, () => Accordion.Header, ($$anchor, Accordion_Header) => {
			Accordion_Header($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_1 = $.first_child(fragment_1);

					$.component(node_1, () => Accordion.Trigger, ($$anchor, Accordion_Trigger) => {
						Accordion_Trigger($$anchor, {
							class: 'flex w-full flex-1 select-none items-center justify-between gap-3 py-5 text-[15px] font-medium transition-all [&[data-state=open]>span>svg]:rotate-180',
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root();
								var div = $.first_child(fragment_2);
								var text = $.only_child(div, true);
								var span = $.sibling(div, 2);
								var text_1 = $.only_child(span, true);
								var span_1 = $.sibling(span, 2);
								var node_2 = $.child(span_1);

								CaretDown(node_2, { class: 'size-[18px] transition-transform duration-200' });
								$.reset(span_1);

								$.template_effect(
									($0) => {
										$.set_class(div, 1, $0);
										$.set_text(text, $.get(isCompleted) ? "✓" : value());
										$.set_text(text_1, title());
									},
									[
										() => $.clsx(cn("border-foreground/30 flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium", $.get(isCompleted) ? "text-foreground" : "text-muted-foreground"))
									]
								);

								$.append($$anchor, fragment_2);
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
	};

	let activeStep = $.state("");
	let completedSteps = new SvelteSet();
	var fragment_3 = $.comment();
	var node_3 = $.first_child(fragment_3);

	$.component(node_3, () => Accordion.Root, ($$anchor, Accordion_Root) => {
		Accordion_Root($$anchor, {
			class: 'w-full sm:max-w-[70%]',
			type: 'single',
			get value() {
				return $.get(activeStep);
			},

			set value($$value) {
				$.set(activeStep, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_4 = root_6();
				var node_4 = $.first_child(fragment_4);

				$.component(node_4, () => Accordion.Item, ($$anchor, Accordion_Item) => {
					Accordion_Item($$anchor, {
						value: '1',
						class: 'border-dark-10 group border-b px-1.5',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_3();
							var node_5 = $.first_child(fragment_5);

							MyAccordionHeader(node_5, () => ({ title: "Shipping Information", value: "1" }));

							var node_6 = $.sibling(node_5, 2);

							$.component(node_6, () => Accordion.Content, ($$anchor, Accordion_Content) => {
								Accordion_Content($$anchor, {
									class: 'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm tracking-[-0.01em]',
									children: ($$anchor, $$slotProps) => {
										var div_2 = root_2();
										var div_3 = $.child(div_2);
										var node_7 = $.child(div_3);

										InputField(node_7, () => ({ label: "First Name", placeholder: "John" }));

										var node_8 = $.sibling(node_7, 2);

										InputField(node_8, () => ({ label: "Last Name", placeholder: "Doe" }));

										var div_4 = $.sibling(node_8, 2);
										var node_9 = $.child(div_4);

										InputField(node_9, () => ({ label: "Address", placeholder: "1234 Elm Street" }));
										$.reset(div_4);

										var node_10 = $.sibling(div_4, 2);

										InputField(node_10, () => ({ label: "City", placeholder: "Tampa" }));

										var node_11 = $.sibling(node_10, 2);

										InputField(node_11, () => ({ label: "ZIP", placeholder: "123456" }));
										$.reset(div_3);

										var div_5 = $.sibling(div_3, 2);
										var node_12 = $.child(div_5);

										$.component(node_12, () => Button.Root, ($$anchor, Button_Root) => {
											Button_Root($$anchor, {
												class: 'rounded-input bg-dark text-background shadow-mini hover:bg-dark/95 inline-flex h-10 select-none items-center justify-center whitespace-nowrap px-[21px] text-sm font-medium transition-all hover:cursor-pointer active:scale-[0.98]',
												onclick: () => {
													completedSteps.add("1");
													$.set(activeStep, "2");
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('Continue to Payment');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										});

										$.reset(div_5);
										$.reset(div_2);
										$.append($$anchor, div_2);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});
				});

				var node_13 = $.sibling(node_4, 2);

				$.component(node_13, () => Accordion.Item, ($$anchor, Accordion_Item_1) => {
					Accordion_Item_1($$anchor, {
						value: '2',
						class: 'border-dark-10 group border-b px-1.5',
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_3();
							var node_14 = $.first_child(fragment_6);

							MyAccordionHeader(node_14, () => ({ title: "Payment Method", value: "2" }));

							var node_15 = $.sibling(node_14, 2);

							$.component(node_15, () => Accordion.Content, ($$anchor, Accordion_Content_1) => {
								Accordion_Content_1($$anchor, {
									class: 'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm tracking-[-0.01em]',
									children: ($$anchor, $$slotProps) => {
										var div_6 = root_4();
										var div_7 = $.child(div_6);
										var div_8 = $.child(div_7);
										var node_16 = $.child(div_8);

										InputField(node_16, () => ({ label: "Card Number", placeholder: "4242 4242 4242 4242" }));
										$.reset(div_8);

										var node_17 = $.sibling(div_8, 2);

										InputField(node_17, () => ({ label: "Exp. Month", placeholder: "MM" }));

										var node_18 = $.sibling(node_17, 2);

										InputField(node_18, () => ({ label: "Exp. Year", placeholder: "YY" }));

										var node_19 = $.sibling(node_18, 2);

										InputField(node_19, () => ({ label: "CVC", placeholder: "123" }));
										$.reset(div_7);

										var div_9 = $.sibling(div_7, 2);
										var node_20 = $.child(div_9);

										$.component(node_20, () => Button.Root, ($$anchor, Button_Root_1) => {
											Button_Root_1($$anchor, {
												class: 'rounded-input bg-dark text-background shadow-mini hover:bg-dark/95 inline-flex h-10 select-none items-center justify-center whitespace-nowrap px-[21px] text-sm font-medium transition-all hover:cursor-pointer active:scale-[0.98]',
												onclick: () => {
													completedSteps.add("2");
													$.set(activeStep, "3");
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('Continue to Review');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});
										});

										$.reset(div_9);
										$.reset(div_6);
										$.append($$anchor, div_6);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});
				});

				var node_21 = $.sibling(node_13, 2);

				$.component(node_21, () => Accordion.Item, ($$anchor, Accordion_Item_2) => {
					Accordion_Item_2($$anchor, {
						value: '3',
						class: 'border-dark-10 group border-b px-1.5',
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root_3();
							var node_22 = $.first_child(fragment_7);

							MyAccordionHeader(node_22, () => ({ title: "Payment Method", value: "3" }));

							var node_23 = $.sibling(node_22, 2);

							$.component(node_23, () => Accordion.Content, ($$anchor, Accordion_Content_2) => {
								Accordion_Content_2($$anchor, {
									class: 'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden pb-6 text-sm tracking-[-0.01em]',
									children: ($$anchor, $$slotProps) => {
										var div_10 = root_5();
										var div_11 = $.sibling($.child(div_10), 2);
										var node_24 = $.child(div_11);

										$.component(node_24, () => Button.Root, ($$anchor, Button_Root_2) => {
											Button_Root_2($$anchor, {
												class: 'rounded-input bg-dark text-background shadow-mini hover:bg-dark/95 inline-flex h-10 select-none items-center justify-center whitespace-nowrap px-[21px] text-sm font-medium transition-all hover:cursor-pointer active:scale-[0.98]',
												onclick: () => {
													completedSteps.add("3");
													$.set(activeStep, "");
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text('Place Order');

													$.append($$anchor, text_5);
												},
												$$slots: { default: true }
											});
										});

										$.reset(div_11);
										$.reset(div_10);
										$.append($$anchor, div_10);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_7);
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
	$.pop();
}