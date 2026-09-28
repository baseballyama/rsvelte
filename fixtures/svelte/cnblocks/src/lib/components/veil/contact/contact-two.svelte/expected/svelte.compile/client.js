import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/components/ui/veil/button";
import { Card } from "$lib/components/ui/veil/card";
import { Input } from "$lib/components/ui/veil/input";
import { Label } from "$lib/components/ui/label";
import * as Select from "$lib/components/ui/select";
import { Textarea } from "$lib/components/ui/veil/textarea";

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<form action="" class="space-y-5"><div class="grid gap-4 @md:grid-cols-2"><div class="space-y-2"><!> <!></div> <div class="space-y-2"><!> <!></div></div> <div class="space-y-2"><!> <!></div> <div class="space-y-2"><!> <!></div> <div class="grid gap-4 @md:grid-cols-2"><div class="space-y-2"><!> <!></div> <div class="space-y-2"><!> <!></div></div> <div class="space-y-2"><!> <!></div> <!></form>`);
var root_4 = $.from_html(`<section class="@container bg-background py-24"><div class="mx-auto max-w-2xl px-6"><div class="text-center"><h1 class="font-serif text-4xl font-medium text-balance sm:text-5xl">Contact Sales</h1> <p class="mx-auto mt-4 max-w-md text-balance text-muted-foreground">Ready to get started? Our team will help you find the right plan for your business.</p></div> <!> <p class="mt-6 text-center text-sm text-muted-foreground">By submitting, you agree to our <a href="/" class="text-foreground underline">Privacy Policy</a></p></div></section>`);

export default function Contact_two($$anchor) {
	var section = root_4();
	var div = $.child(section);
	var node = $.sibling($.child(div), 2);

	Card(node, {
		variant: 'outline',
		class: 'mt-12 p-8',
		children: ($$anchor, $$slotProps) => {
			var form = root_3();
			var div_1 = $.child(form);
			var div_2 = $.child(div_1);
			var node_1 = $.child(div_2);

			Label(node_1, {
				for: 'firstName',
				class: 'text-sm',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('First name');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Input(node_2, {
				type: 'text',
				id: 'firstName',
				name: 'firstName',
				placeholder: 'John',
				required: true
			});

			$.reset(div_2);

			var div_3 = $.sibling(div_2, 2);
			var node_3 = $.child(div_3);

			Label(node_3, {
				for: 'lastName',
				class: 'text-sm',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Last name');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Input(node_4, {
				type: 'text',
				id: 'lastName',
				name: 'lastName',
				placeholder: 'Doe',
				required: true
			});

			$.reset(div_3);
			$.reset(div_1);

			var div_4 = $.sibling(div_1, 2);
			var node_5 = $.child(div_4);

			Label(node_5, {
				for: 'email',
				class: 'text-sm',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Work email');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			Input(node_6, {
				type: 'email',
				id: 'email',
				name: 'email',
				placeholder: 'you@company.com',
				required: true
			});

			$.reset(div_4);

			var div_5 = $.sibling(div_4, 2);
			var node_7 = $.child(div_5);

			Label(node_7, {
				for: 'company',
				class: 'text-sm',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Company');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_7, 2);

			Input(node_8, {
				type: 'text',
				id: 'company',
				name: 'company',
				placeholder: 'Acme Inc.'
			});

			$.reset(div_5);

			var div_6 = $.sibling(div_5, 2);
			var div_7 = $.child(div_6);
			var node_9 = $.child(div_7);

			Label(node_9, {
				for: 'size',
				class: 'text-sm',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Company size');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_9, 2);

			$.component(node_10, () => Select.Root, ($$anchor, Select_Root) => {
				Select_Root($$anchor, {
					type: 'single',
					children: ($$anchor, $$slotProps) => {
						var fragment = root_1();
						var node_11 = $.first_child(fragment);

						$.component(node_11, () => Select.Trigger, ($$anchor, Select_Trigger) => {
							Select_Trigger($$anchor, {
								class: 'h-8 bg-card shadow-none ring-input focus-visible:ring-ring/15 dark:bg-transparent',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Select');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});
						});

						var node_12 = $.sibling(node_11, 2);

						$.component(node_12, () => Select.Content, ($$anchor, Select_Content) => {
							Select_Content($$anchor, {
								class: 'rounded-xl border-transparent ring-1 ring-border',
								children: ($$anchor, $$slotProps) => {
									var fragment_1 = root();
									var node_13 = $.first_child(fragment_1);

									$.component(node_13, () => Select.Item, ($$anchor, Select_Item) => {
										Select_Item($$anchor, {
											value: '1-10',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_6 = $.text('1-10 employees');

												$.append($$anchor, text_6);
											},
											$$slots: { default: true }
										});
									});

									var node_14 = $.sibling(node_13, 2);

									$.component(node_14, () => Select.Item, ($$anchor, Select_Item_1) => {
										Select_Item_1($$anchor, {
											value: '11-50',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_7 = $.text('11-50 employees');

												$.append($$anchor, text_7);
											},
											$$slots: { default: true }
										});
									});

									var node_15 = $.sibling(node_14, 2);

									$.component(node_15, () => Select.Item, ($$anchor, Select_Item_2) => {
										Select_Item_2($$anchor, {
											value: '51-200',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_8 = $.text('51-200 employees');

												$.append($$anchor, text_8);
											},
											$$slots: { default: true }
										});
									});

									var node_16 = $.sibling(node_15, 2);

									$.component(node_16, () => Select.Item, ($$anchor, Select_Item_3) => {
										Select_Item_3($$anchor, {
											value: '201-500',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_9 = $.text('201-500 employees');

												$.append($$anchor, text_9);
											},
											$$slots: { default: true }
										});
									});

									var node_17 = $.sibling(node_16, 2);

									$.component(node_17, () => Select.Item, ($$anchor, Select_Item_4) => {
										Select_Item_4($$anchor, {
											value: '500+',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_10 = $.text('500+ employees');

												$.append($$anchor, text_10);
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
					},
					$$slots: { default: true }
				});
			});

			$.reset(div_7);

			var div_8 = $.sibling(div_7, 2);
			var node_18 = $.child(div_8);

			Label(node_18, {
				for: 'interest',
				class: 'text-sm',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_11 = $.text('Interest');

					$.append($$anchor, text_11);
				},
				$$slots: { default: true }
			});

			var node_19 = $.sibling(node_18, 2);

			$.component(node_19, () => Select.Root, ($$anchor, Select_Root_1) => {
				Select_Root_1($$anchor, {
					type: 'single',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_20 = $.first_child(fragment_2);

						$.component(node_20, () => Select.Trigger, ($$anchor, Select_Trigger_1) => {
							Select_Trigger_1($$anchor, {
								class: 'h-8 bg-card shadow-none ring-input focus-visible:ring-ring/15 dark:bg-transparent',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_12 = $.text('Select');

									$.append($$anchor, text_12);
								},
								$$slots: { default: true }
							});
						});

						var node_21 = $.sibling(node_20, 2);

						$.component(node_21, () => Select.Content, ($$anchor, Select_Content_1) => {
							Select_Content_1($$anchor, {
								class: 'rounded-xl border-transparent ring-1 ring-border',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_2();
									var node_22 = $.first_child(fragment_3);

									$.component(node_22, () => Select.Item, ($$anchor, Select_Item_5) => {
										Select_Item_5($$anchor, {
											value: 'pricing',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_13 = $.text('Pricing');

												$.append($$anchor, text_13);
											},
											$$slots: { default: true }
										});
									});

									var node_23 = $.sibling(node_22, 2);

									$.component(node_23, () => Select.Item, ($$anchor, Select_Item_6) => {
										Select_Item_6($$anchor, {
											value: 'demo',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_14 = $.text('Product demo');

												$.append($$anchor, text_14);
											},
											$$slots: { default: true }
										});
									});

									var node_24 = $.sibling(node_23, 2);

									$.component(node_24, () => Select.Item, ($$anchor, Select_Item_7) => {
										Select_Item_7($$anchor, {
											value: 'partnership',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_15 = $.text('Partnership');

												$.append($$anchor, text_15);
											},
											$$slots: { default: true }
										});
									});

									var node_25 = $.sibling(node_24, 2);

									$.component(node_25, () => Select.Item, ($$anchor, Select_Item_8) => {
										Select_Item_8($$anchor, {
											value: 'other',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_16 = $.text('Other');

												$.append($$anchor, text_16);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div_8);
			$.reset(div_6);

			var div_9 = $.sibling(div_6, 2);
			var node_26 = $.child(div_9);

			Label(node_26, {
				for: 'message',
				class: 'text-sm',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_17 = $.text('Message');

					$.append($$anchor, text_17);
				},
				$$slots: { default: true }
			});

			var node_27 = $.sibling(node_26, 2);

			Textarea(node_27, {
				id: 'message',
				name: 'message',
				rows: 5,
				placeholder: 'Tell us about your needs...',
				class: 'min-h-28'
			});

			$.reset(div_9);

			var node_28 = $.sibling(div_9, 2);

			Button(node_28, {
				class: 'w-full',
				type: 'submit',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_18 = $.text('Submit');

					$.append($$anchor, text_18);
				},
				$$slots: { default: true }
			});

			$.reset(form);
			$.append($$anchor, form);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}