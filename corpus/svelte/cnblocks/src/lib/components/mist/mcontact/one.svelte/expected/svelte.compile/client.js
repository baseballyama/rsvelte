import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/components/ui/button/button.svelte";
import Card from "$lib/components/ui/card/card.svelte";
import Input from "$lib/components/ui/input/input.svelte";
import Label from "$lib/components/ui/label/label.svelte";
import { Select, SelectContent, SelectItem, SelectTrigger } from "$lib/components/ui/select";
import Textarea from "$lib/components/ui/textarea/textarea.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);

var root_3 = $.from_html(
	`<h3 class="text-xl font-semibold">Let's get you to the right place</h3> <p class="mt-4 text-sm">Reach out to our sales team! We’re eager to learn more about how you plan to
						use our application.</p> <div class="mt-12 space-y-6 *:space-y-3 **:[&amp;>label]:block"><div class="grid gap-3 *:space-y-3 @md:grid-cols-2"><div><!> <!></div> <div><!> <!></div></div> <div><!> <!></div> <div class="grid gap-3 *:space-y-3 @md:grid-cols-2"><div><!> <!></div> <div><!> <!></div></div> <div><!> <!></div> <!></div>`,
	1
);

var root_4 = $.from_html(`<section class="bg-muted py-15 [--color-primary:var(--color-indigo-500)] sm:py-24 lg:py-32 dark:bg-muted/30"><div class="mx-auto max-w-4xl px-4 lg:px-0"><h1 class="text-4xl font-semibold lg:text-5xl">Help us route your inquiry</h1> <p class="mt-4 text-lg text-muted-foreground">We'll help you find the right plan and pricing for your business.</p> <div class="mt-12 grid gap-12 lg:grid-cols-5"><div class="grid grid-cols-2 lg:col-span-2 lg:block lg:space-y-12"><div class="flex flex-col justify-between space-y-6"><div><h2 class="mb-3 text-lg font-semibold">Collaborate</h2> <a href="mailto:hello@tailus.com" class="text-lg text-primary hover:underline">hello@tailark.com</a> <p class="mt-3 text-sm">+243 000 000 000</p></div></div> <div class="flex flex-col justify-between space-y-6"><div><h3 class="mb-3 text-lg font-semibold">Press</h3> <a href="mailto:press@tailark.com" class="text-lg text-primary hover:underline">press@tailark.com</a> <p class="mt-3 text-sm">+243 000 000 000</p></div></div></div> <form action="" class="@container lg:col-span-3"><!></form></div></div></section>`);

export default function One($$anchor) {
	var section = root_4();
	var div = $.child(section);
	var div_1 = $.sibling($.child(div), 4);
	var form = $.sibling($.child(div_1), 2);
	var node = $.child(form);

	Card(node, {
		class: 'p-8 sm:p-12',
		children: ($$anchor, $$slotProps) => {
			var fragment = root_3();
			var div_2 = $.sibling($.first_child(fragment), 4);
			var div_3 = $.child(div_2);
			var div_4 = $.child(div_3);
			var node_1 = $.child(div_4);

			Label(node_1, {
				for: 'name',
				class: 'space-y-2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Full name');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Input(node_2, { type: 'text', id: 'name', placeholder: 'Your name' });
			$.reset(div_4);

			var div_5 = $.sibling(div_4, 2);
			var node_3 = $.child(div_5);

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
				required: true,
				placeholder: 'Your email'
			});

			$.reset(div_5);
			$.reset(div_3);

			var div_6 = $.sibling(div_3, 2);
			var node_5 = $.child(div_6);

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

			Select(node_6, {
				type: 'single',
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_1();
					var node_7 = $.first_child(fragment_1);

					SelectTrigger(node_7, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Select a country');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					SelectContent(node_8, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_9 = $.first_child(fragment_2);

							SelectItem(node_9, {
								value: '1',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('DR Congo');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							var node_10 = $.sibling(node_9, 2);

							SelectItem(node_10, {
								value: '2',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('United States');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});

							var node_11 = $.sibling(node_10, 2);

							SelectItem(node_11, {
								value: '3',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text('France');

									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			$.reset(div_6);

			var div_7 = $.sibling(div_6, 2);
			var div_8 = $.child(div_7);
			var node_12 = $.child(div_8);

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

			Input(node_13, { type: 'url', id: 'website', placeholder: 'Your website' });
			$.reset(div_8);

			var div_9 = $.sibling(div_8, 2);
			var node_14 = $.child(div_9);

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

			Select(node_15, {
				type: 'single',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_16 = $.first_child(fragment_3);

					SelectTrigger(node_16, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_9 = $.text('Select a job function');

							$.append($$anchor, text_9);
						},
						$$slots: { default: true }
					});

					var node_17 = $.sibling(node_16, 2);

					SelectContent(node_17, {
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_2();
							var node_18 = $.first_child(fragment_4);

							SelectItem(node_18, {
								value: '1',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_10 = $.text('Finance');

									$.append($$anchor, text_10);
								},
								$$slots: { default: true }
							});

							var node_19 = $.sibling(node_18, 2);

							SelectItem(node_19, {
								value: '2',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_11 = $.text('Education');

									$.append($$anchor, text_11);
								},
								$$slots: { default: true }
							});

							var node_20 = $.sibling(node_19, 2);

							SelectItem(node_20, {
								value: '3',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_12 = $.text('Legal');

									$.append($$anchor, text_12);
								},
								$$slots: { default: true }
							});

							var node_21 = $.sibling(node_20, 2);

							SelectItem(node_21, {
								value: '4',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_13 = $.text('More');

									$.append($$anchor, text_13);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.reset(div_9);
			$.reset(div_7);

			var div_10 = $.sibling(div_7, 2);
			var node_22 = $.child(div_10);

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

			Textarea(node_23, { id: 'msg', rows: 3, placeholder: 'Enter your message' });
			$.reset(div_10);

			var node_24 = $.sibling(div_10, 2);

			Button(node_24, {
				variant: 'mdefault',
				size: 'default',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_15 = $.text('Submit');

					$.append($$anchor, text_15);
				},
				$$slots: { default: true }
			});

			$.reset(div_2);
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(form);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}