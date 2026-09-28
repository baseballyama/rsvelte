import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/components/ui/button/button.svelte";
import Check from "@lucide/svelte/icons/check";

var root = $.from_html(`<li class="flex items-center gap-2"><!> </li>`);

var root_1 = $.from_html(`<section class="py-16 md:py-32"><div class="mx-auto max-w-5xl px-6"><div class="mx-auto max-w-2xl space-y-6 text-center"><h1 class="text-center text-4xl font-semibold lg:text-5xl">Pricing that Scales with You</h1> <p>Gemini is evolving to be more than just the models. It supports an entire to the
				APIs and platforms helping developers and businesses innovate.</p></div> <div class="mt-8 grid gap-6 md:mt-20 md:grid-cols-5 md:gap-0"><div class="flex flex-col justify-between space-y-8 rounded-(--radius) border p-6 md:col-span-2 md:my-2 md:rounded-r-none md:border-r-0 lg:p-10"><div class="space-y-4"><div><h2 class="font-medium">Free</h2> <span class="my-3 block text-2xl font-semibold">$0 / mo</span> <p class="text-sm text-muted-foreground">Per editor</p></div> <!> <hr class="border-dashed"/> <ul class="list-outside space-y-3 text-sm"></ul></div></div> <div class="rounded-(--radius) border p-6 shadow-lg shadow-gray-950/5 md:col-span-3 lg:p-10 dark:bg-muted dark:[--color-muted:var(--color-zinc-900)]"><div class="grid gap-6 sm:grid-cols-2"><div class="space-y-4"><div><h2 class="font-medium">Pro</h2> <span class="my-3 block text-2xl font-semibold">$19 / mo</span> <p class="text-sm text-muted-foreground">Per editor</p></div> <!></div> <div><div class="text-sm font-medium">Everything in free plus :</div> <ul class="mt-4 list-outside space-y-3 text-sm"></ul></div></div></div></div></div></section>`);

export default function Pricing_four($$anchor) {
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

	var section = root_1();
	var div = $.child(section);
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var node = $.sibling($.child(div_3), 2);

	Button(node, {
		href: '/',
		variant: 'outline',
		class: 'w-full',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Get Started');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var ul = $.sibling(node, 4);

	$.each(ul, 21, () => pricingList.free, $.index, ($$anchor, item) => {
		var li = root();
		var node_1 = $.child(li);

		Check(node_1, { class: 'size-3' });

		var text_1 = $.sibling(node_1);

		$.reset(li);
		$.template_effect(() => $.set_text(text_1, ` ${$.get(item) ?? ''}`));
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.reset(div_3);
	$.reset(div_2);

	var div_4 = $.sibling(div_2, 2);
	var div_5 = $.child(div_4);
	var div_6 = $.child(div_5);
	var node_2 = $.sibling($.child(div_6), 2);

	Button(node_2, {
		href: '/',
		class: 'w-full',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Get Started');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var ul_1 = $.sibling($.child(div_7), 2);

	$.each(ul_1, 21, () => pricingList.pro, $.index, ($$anchor, item) => {
		var li_1 = root();
		var node_3 = $.child(li_1);

		Check(node_3, { class: 'size-3' });

		var text_3 = $.sibling(node_3);

		$.reset(li_1);
		$.template_effect(() => $.set_text(text_3, ` ${$.get(item) ?? ''}`));
		$.append($$anchor, li_1);
	});

	$.reset(ul_1);
	$.reset(div_7);
	$.reset(div_5);
	$.reset(div_4);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}