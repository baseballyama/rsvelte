import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/components/ui/button/button.svelte";
import { Card } from "$lib/components/ui/card";
import Input from "$lib/components/ui/input/input.svelte";
import Label from "$lib/components/ui/label/label.svelte";
import * as Select from "$lib/components/ui/select/index.js";
import { Textarea } from "$lib/components/ui/textarea";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);

var root_3 = $.from_html(
	`<div><h2 class="text-xl font-semibold">Let's get you to the right place</h2> <p class="mt-4 text-sm">Reach out to our sales team! We're eager to learn more about how you plan to use
					our application.</p></div> <form action="" class="mt-12 space-y-6 *:space-y-3 **:[&amp;>label]:block"><div><!> <!></div> <div><!> <!></div> <div><!> <!></div> <div><!> <!> <span class="inline-block text-sm text-muted-foreground">Must start with 'https'</span></div> <div><!> <!></div> <div><!> <!></div> <!></form>`,
	1
);

var root_4 = $.from_html(`<section class="py-32"><div class="mx-auto max-w-3xl px-8 lg:px-0"><h1 class="text-center text-4xl font-semibold lg:text-5xl">Contact Sales</h1> <p class="mt-4 text-center">We'll help you find the right plan and pricing for your business.</p> <!></div></section>`);

export default function Contact_one($$anchor) {
	var section = root_4();
	var div = $.child(section);
	var node = $.sibling($.child(div), 4);

	Card(node, {
		class: 'mx-auto mt-12 max-w-lg p-8 shadow-md sm:p-16',
		children: ($$anchor, $$slotProps) => {
			var fragment = root_3();
			var form = $.sibling($.first_child(fragment), 2);
			var div_1 = $.child(form);
			var node_1 = $.child(div_1);

			Label(node_1, {
				for: 'name',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Full name');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Input(node_2, {
				type: 'text',
				id: 'name',
				placeholder: 'John Doe',
				required: true
			});

			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var node_3 = $.child(div_2);

			Label(node_3, {
				for: 'email',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Work Email');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Input(node_4, {
				type: 'email',
				id: 'email',
				placeholder: 'you@company.com',
				required: true
			});

			$.reset(div_2);

			var div_3 = $.sibling(div_2, 2);
			var node_5 = $.child(div_3);

			Label(node_5, {
				for: 'country',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Country/Region');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			$.component(node_6, () => Select.Root, ($$anchor, Select_Root) => {
				Select_Root($$anchor, {
					type: 'single',
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_1();
						var node_7 = $.first_child(fragment_1);

						$.component(node_7, () => Select.Trigger, ($$anchor, Select_Trigger) => {
							Select_Trigger($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Select Country/Region');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						});

						var node_8 = $.sibling(node_7, 2);

						$.component(node_8, () => Select.Content, ($$anchor, Select_Content) => {
							Select_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = root();
									var node_9 = $.first_child(fragment_2);

									$.component(node_9, () => Select.Item, ($$anchor, Select_Item) => {
										Select_Item($$anchor, {
											value: '1',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('DR Congo');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});
									});

									var node_10 = $.sibling(node_9, 2);

									$.component(node_10, () => Select.Item, ($$anchor, Select_Item_1) => {
										Select_Item_1($$anchor, {
											value: '2',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_5 = $.text('United States');

												$.append($$anchor, text_5);
											},
											$$slots: { default: true }
										});
									});

									var node_11 = $.sibling(node_10, 2);

									$.component(node_11, () => Select.Item, ($$anchor, Select_Item_2) => {
										Select_Item_2($$anchor, {
											value: '3',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_6 = $.text('France');

												$.append($$anchor, text_6);
											},
											$$slots: { default: true }
										});
									});

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

			$.reset(div_3);

			var div_4 = $.sibling(div_3, 2);
			var node_12 = $.child(div_4);

			Label(node_12, {
				for: 'website',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('Company Website');

					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});

			var node_13 = $.sibling(node_12, 2);

			Input(node_13, {
				type: 'url',
				id: 'website',
				placeholder: 'https://company.com'
			});

			$.next(2);
			$.reset(div_4);

			var div_5 = $.sibling(div_4, 2);
			var node_14 = $.child(div_5);

			Label(node_14, {
				for: 'job',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_8 = $.text('Job function');

					$.append($$anchor, text_8);
				},
				$$slots: { default: true }
			});

			var node_15 = $.sibling(node_14, 2);

			$.component(node_15, () => Select.Root, ($$anchor, Select_Root_1) => {
				Select_Root_1($$anchor, {
					type: 'single',
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root_1();
						var node_16 = $.first_child(fragment_3);

						$.component(node_16, () => Select.Trigger, ($$anchor, Select_Trigger_1) => {
							Select_Trigger_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_9 = $.text('Select Job Function');

									$.append($$anchor, text_9);
								},
								$$slots: { default: true }
							});
						});

						var node_17 = $.sibling(node_16, 2);

						$.component(node_17, () => Select.Content, ($$anchor, Select_Content_1) => {
							Select_Content_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_2();
									var node_18 = $.first_child(fragment_4);

									$.component(node_18, () => Select.Item, ($$anchor, Select_Item_3) => {
										Select_Item_3($$anchor, {
											value: '1',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_10 = $.text('Finance');

												$.append($$anchor, text_10);
											},
											$$slots: { default: true }
										});
									});

									var node_19 = $.sibling(node_18, 2);

									$.component(node_19, () => Select.Item, ($$anchor, Select_Item_4) => {
										Select_Item_4($$anchor, {
											value: '2',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_11 = $.text('Education');

												$.append($$anchor, text_11);
											},
											$$slots: { default: true }
										});
									});

									var node_20 = $.sibling(node_19, 2);

									$.component(node_20, () => Select.Item, ($$anchor, Select_Item_5) => {
										Select_Item_5($$anchor, {
											value: '3',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_12 = $.text('Legal');

												$.append($$anchor, text_12);
											},
											$$slots: { default: true }
										});
									});

									var node_21 = $.sibling(node_20, 2);

									$.component(node_21, () => Select.Item, ($$anchor, Select_Item_6) => {
										Select_Item_6($$anchor, {
											value: '4',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_13 = $.text('More');

												$.append($$anchor, text_13);
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

			$.reset(div_5);

			var div_6 = $.sibling(div_5, 2);
			var node_22 = $.child(div_6);

			Label(node_22, {
				for: 'msg',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_14 = $.text('Message');

					$.append($$anchor, text_14);
				},
				$$slots: { default: true }
			});

			var node_23 = $.sibling(node_22, 2);

			Textarea(node_23, {
				id: 'msg',
				rows: 3,
				placeholder: 'Tell us about your needs...'
			});

			$.reset(div_6);

			var node_24 = $.sibling(div_6, 2);

			Button(node_24, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_15 = $.text('Submit');

					$.append($$anchor, text_15);
				},
				$$slots: { default: true }
			});

			$.reset(form);
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}