import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils/styles.js";
import { Accordion, useId, Button } from "bits-ui";
import CaretDown from "phosphor-svelte/lib/CaretDown";
import { SvelteSet } from "svelte/reactivity";

function InputField($$renderer, { label, placeholder, type = "text" }) {
	const id = useId();

	$$renderer.push(`<div class="flex flex-col gap-1"><label class="select-none text-sm font-medium"${$.attr('for', id)}>${$.escape(label)}</label> <input${$.attr('type', type)}${$.attr('id', id)}${$.attr('name', label)}${$.attr('placeholder', placeholder)} class="rounded-card-sm border-border-input bg-background placeholder:text-foreground-alt/50 hover:border-dark-40 focus-override inline-flex h-10 w-full items-center border px-4 text-base sm:text-sm"/></div>`);
}

export default function Accordion_demo_checkout_steps($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let activeStep = "";
		let completedSteps = new SvelteSet();

		function MyAccordionHeader($$renderer, { value, title }) {
			const isCompleted = completedSteps.has(value);

			if (Accordion.Header) {
				$$renderer.push('<!--[-->');

				Accordion.Header($$renderer, {
					children: ($$renderer) => {
						if (Accordion.Trigger) {
							$$renderer.push('<!--[-->');

							Accordion.Trigger($$renderer, {
								class: 'flex w-full flex-1 select-none items-center justify-between gap-3 py-5 text-[15px] font-medium transition-all [&[data-state=open]>span>svg]:rotate-180',
								children: ($$renderer) => {
									$$renderer.push(`<div${$.attr_class($.clsx(cn("border-foreground/30 flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium", isCompleted ? "text-foreground" : "text-muted-foreground")))}>${$.escape(isCompleted ? "✓" : value)}</div> <span class="w-full text-left">${$.escape(title)}</span> <span class="hover:bg-dark-10 inline-flex size-8 items-center justify-center rounded-[7px] bg-transparent">`);
									CaretDown($$renderer, { class: 'size-[18px] transition-transform duration-200' });
									$$renderer.push(`<!----></span>`);
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
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Accordion.Root) {
				$$renderer.push('<!--[-->');

				Accordion.Root($$renderer, {
					class: 'w-full sm:max-w-[70%]',
					type: 'single',
					get value() {
						return activeStep;
					},

					set value($$value) {
						activeStep = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Accordion.Item) {
							$$renderer.push('<!--[-->');

							Accordion.Item($$renderer, {
								value: '1',
								class: 'border-dark-10 group border-b px-1.5',
								children: ($$renderer) => {
									MyAccordionHeader($$renderer, { title: "Shipping Information", value: "1" });
									$$renderer.push(`<!----> `);

									if (Accordion.Content) {
										$$renderer.push('<!--[-->');

										Accordion.Content($$renderer, {
											class: 'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm tracking-[-0.01em]',
											children: ($$renderer) => {
												$$renderer.push(`<div class="flex flex-col gap-4 pb-6 pt-2"><div class="grid grid-cols-2 gap-4">`);
												InputField($$renderer, { label: "First Name", placeholder: "John" });
												$$renderer.push(`<!----> `);
												InputField($$renderer, { label: "Last Name", placeholder: "Doe" });
												$$renderer.push(`<!----> <div class="col-span-2">`);
												InputField($$renderer, { label: "Address", placeholder: "1234 Elm Street" });
												$$renderer.push(`<!----></div> `);
												InputField($$renderer, { label: "City", placeholder: "Tampa" });
												$$renderer.push(`<!----> `);
												InputField($$renderer, { label: "ZIP", placeholder: "123456" });
												$$renderer.push(`<!----></div> <div class="pt-2">`);

												if (Button.Root) {
													$$renderer.push('<!--[-->');

													Button.Root($$renderer, {
														class: 'rounded-input bg-dark text-background shadow-mini hover:bg-dark/95 inline-flex h-10 select-none items-center justify-center whitespace-nowrap px-[21px] text-sm font-medium transition-all hover:cursor-pointer active:scale-[0.98]',
														onclick: () => {
															completedSteps.add("1");
															activeStep = "2";
														},

														children: ($$renderer) => {
															$$renderer.push(`<!---->Continue to Payment`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(`</div></div>`);
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

						if (Accordion.Item) {
							$$renderer.push('<!--[-->');

							Accordion.Item($$renderer, {
								value: '2',
								class: 'border-dark-10 group border-b px-1.5',
								children: ($$renderer) => {
									MyAccordionHeader($$renderer, { title: "Payment Method", value: "2" });
									$$renderer.push(`<!----> `);

									if (Accordion.Content) {
										$$renderer.push('<!--[-->');

										Accordion.Content($$renderer, {
											class: 'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm tracking-[-0.01em]',
											children: ($$renderer) => {
												$$renderer.push(`<div class="flex flex-col gap-4 pb-6 pt-2"><div class="grid grid-cols-3 gap-4"><div class="col-span-3">`);
												InputField($$renderer, { label: "Card Number", placeholder: "4242 4242 4242 4242" });
												$$renderer.push(`<!----></div> `);
												InputField($$renderer, { label: "Exp. Month", placeholder: "MM" });
												$$renderer.push(`<!----> `);
												InputField($$renderer, { label: "Exp. Year", placeholder: "YY" });
												$$renderer.push(`<!----> `);
												InputField($$renderer, { label: "CVC", placeholder: "123" });
												$$renderer.push(`<!----></div> <div class="pt-2">`);

												if (Button.Root) {
													$$renderer.push('<!--[-->');

													Button.Root($$renderer, {
														class: 'rounded-input bg-dark text-background shadow-mini hover:bg-dark/95 inline-flex h-10 select-none items-center justify-center whitespace-nowrap px-[21px] text-sm font-medium transition-all hover:cursor-pointer active:scale-[0.98]',
														onclick: () => {
															completedSteps.add("2");
															activeStep = "3";
														},

														children: ($$renderer) => {
															$$renderer.push(`<!---->Continue to Review`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(`</div></div>`);
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

						if (Accordion.Item) {
							$$renderer.push('<!--[-->');

							Accordion.Item($$renderer, {
								value: '3',
								class: 'border-dark-10 group border-b px-1.5',
								children: ($$renderer) => {
									MyAccordionHeader($$renderer, { title: "Payment Method", value: "3" });
									$$renderer.push(`<!----> `);

									if (Accordion.Content) {
										$$renderer.push('<!--[-->');

										Accordion.Content($$renderer, {
											class: 'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden pb-6 text-sm tracking-[-0.01em]',
											children: ($$renderer) => {
												$$renderer.push(`<div class="flex flex-col gap-4 pt-2"><div class="rounded-lg border p-4"><h4 class="mb-2 font-medium">Order Summary</h4> <div class="flex flex-col gap-2"><div class="flex justify-between text-sm"><span class="text-muted-foreground">Product 1</span> <span>$29.99</span></div> <div class="flex justify-between text-sm"><span class="text-muted-foreground">Product 2</span> <span>$49.99</span></div> <div class="flex justify-between text-sm"><span class="text-muted-foreground">Shipping</span> <span>$4.99</span></div> <div class="mt-2 flex justify-between border-t pt-2 font-medium"><span>Total</span> <span>$84.97</span></div></div></div> <div class="pt-2">`);

												if (Button.Root) {
													$$renderer.push('<!--[-->');

													Button.Root($$renderer, {
														class: 'rounded-input bg-dark text-background shadow-mini hover:bg-dark/95 inline-flex h-10 select-none items-center justify-center whitespace-nowrap px-[21px] text-sm font-medium transition-all hover:cursor-pointer active:scale-[0.98]',
														onclick: () => {
															completedSteps.add("3");
															activeStep = "";
														},

														children: ($$renderer) => {
															$$renderer.push(`<!---->Place Order`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(`</div></div>`);
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
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}