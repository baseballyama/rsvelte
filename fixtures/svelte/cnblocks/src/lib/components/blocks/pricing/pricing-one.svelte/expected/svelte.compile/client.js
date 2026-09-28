import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/components/ui/button/button.svelte";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	CardFooter
} from "$lib/components/ui/card";

import Check from "@lucide/svelte/icons/check";

var root = $.from_html(`<!> <span class="my-3 block text-2xl font-semibold">$0 / mo</span> <!>`, 1);
var root_1 = $.from_html(`<li class="flex items-center gap-2"><!> </li>`);
var root_2 = $.from_html(`<hr class="border-dashed"/> <ul class="list-outside space-y-3 text-sm"></ul>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <span class="my-3 block text-2xl font-semibold">$19 / mo</span> <!>`, 1);
var root_5 = $.from_html(`<span class="absolute inset-x-0 -top-3 mx-auto flex h-6 w-fit items-center rounded-full bg-linear-to-br/increasing from-purple-400 to-amber-300 px-3 py-1 text-xs font-medium text-amber-950 ring-1 ring-white/20 ring-offset-1 ring-offset-gray-950/5 ring-inset">Popular</span> <div class="flex flex-col"><!> <!> <!></div>`, 1);
var root_6 = $.from_html(`<!> <span class="my-3 block text-2xl font-semibold">$29 / mo</span> <!>`, 1);

var root_7 = $.from_html(`<section class="py-16 md:py-32"><div class="mx-auto max-w-6xl px-6"><div class="mx-auto max-w-2xl space-y-6 text-center"><h1 class="text-center text-4xl font-semibold lg:text-5xl">Pricing that Scales with You</h1> <p>Gemini is evolving to be more than just the models. It supports an entire to the
				APIs and platforms helping developers and businesses innovate.</p></div> <div class="mt-8 grid gap-6 md:mt-20 md:grid-cols-3"><!> <!> <!></div></div></section>`);

export default function Pricing_one($$anchor) {
	let pricingList = {
		free: [
			"Basic Analytics Dashboard",
			"5GB Cloud Storage",
			"Email and Chat Support"
		],
		startup: [
			"Everything in Pro Plan",
			"5GB Cloud Storage",
			"Email and Chat Support"
		],
		pro: [
			"Everything in Free Plan",
			"5GB Cloud Storage",
			"Email and Chat Support",
			"Access to Community Forum",
			"Single User Access",
			"Access to Basic Templates",
			"Mobile App Access",
			"1 Custom Report Per Month",
			"Monthly Product Updates",
			"Standard Security Features"
		]
	};

	var section = root_7();
	var div = $.child(section);
	var div_1 = $.sibling($.child(div), 2);
	var node = $.child(div_1);

	Card(node, {
		class: 'flex flex-col',
		children: ($$anchor, $$slotProps) => {
			var fragment = root_3();
			var node_1 = $.first_child(fragment);

			CardHeader(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_2 = $.first_child(fragment_1);

					CardTitle(node_2, {
						class: 'font-medium',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Free');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 4);

					CardDescription(node_3, {
						class: 'text-sm',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Per editor');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_1, 2);

			CardContent(node_4, {
				class: 'space-y-4',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_2();
					var ul = $.sibling($.first_child(fragment_2), 2);

					$.each(ul, 21, () => pricingList.free, $.index, ($$anchor, item) => {
						var li = root_1();
						var node_5 = $.child(li);

						Check(node_5, { class: 'size-3' });

						var text_2 = $.sibling(node_5);

						$.reset(li);
						$.template_effect(() => $.set_text(text_2, ` ${$.get(item) ?? ''}`));
						$.append($$anchor, li);
					});

					$.reset(ul);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_4, 2);

			CardFooter(node_6, {
				class: 'mt-auto',
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						href: '/',
						variant: 'outline',
						class: 'w-full',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Get Started');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node, 2);

	Card(node_7, {
		class: 'relative',
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root_5();
			var div_2 = $.sibling($.first_child(fragment_4), 2);
			var node_8 = $.child(div_2);

			CardHeader(node_8, {
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root_4();
					var node_9 = $.first_child(fragment_5);

					CardTitle(node_9, {
						class: 'font-medium',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Pro');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_10 = $.sibling(node_9, 4);

					CardDescription(node_10, {
						class: 'text-sm',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Per editor');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_8, 2);

			CardContent(node_11, {
				class: 'space-y-4',
				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root_2();
					var ul_1 = $.sibling($.first_child(fragment_6), 2);

					$.each(ul_1, 21, () => pricingList.pro, $.index, ($$anchor, item) => {
						var li_1 = root_1();
						var node_12 = $.child(li_1);

						Check(node_12, { class: 'size-3' });

						var text_6 = $.sibling(node_12);

						$.reset(li_1);
						$.template_effect(() => $.set_text(text_6, ` ${$.get(item) ?? ''}`));
						$.append($$anchor, li_1);
					});

					$.reset(ul_1);
					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});

			var node_13 = $.sibling(node_11, 2);

			CardFooter(node_13, {
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						href: '',
						class: 'w-full',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('Get Started');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.reset(div_2);
			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_7, 2);

	Card(node_14, {
		class: 'flex flex-col',
		children: ($$anchor, $$slotProps) => {
			var fragment_8 = root_3();
			var node_15 = $.first_child(fragment_8);

			CardHeader(node_15, {
				children: ($$anchor, $$slotProps) => {
					var fragment_9 = root_6();
					var node_16 = $.first_child(fragment_9);

					CardTitle(node_16, {
						class: 'font-medium',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text('Startup');

							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});

					var node_17 = $.sibling(node_16, 4);

					CardDescription(node_17, {
						class: 'text-sm',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_9 = $.text('Per editor');

							$.append($$anchor, text_9);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_9);
				},
				$$slots: { default: true }
			});

			var node_18 = $.sibling(node_15, 2);

			CardContent(node_18, {
				class: 'space-y-4',
				children: ($$anchor, $$slotProps) => {
					var fragment_10 = root_2();
					var ul_2 = $.sibling($.first_child(fragment_10), 2);

					$.each(ul_2, 21, () => pricingList.startup, $.index, ($$anchor, item) => {
						var li_2 = root_1();
						var node_19 = $.child(li_2);

						Check(node_19, { class: 'size-3' });

						var text_10 = $.sibling(node_19);

						$.reset(li_2);
						$.template_effect(() => $.set_text(text_10, ` ${$.get(item) ?? ''}`));
						$.append($$anchor, li_2);
					});

					$.reset(ul_2);
					$.append($$anchor, fragment_10);
				},
				$$slots: { default: true }
			});

			var node_20 = $.sibling(node_18, 2);

			CardFooter(node_20, {
				class: 'mt-auto',
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						href: '/',
						variant: 'outline',
						class: 'w-full',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_11 = $.text('Get Started');

							$.append($$anchor, text_11);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_8);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}