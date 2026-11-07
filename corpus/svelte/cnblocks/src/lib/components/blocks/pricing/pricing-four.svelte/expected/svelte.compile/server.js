import * as $ from 'svelte/internal/server';
import Button from "$lib/components/ui/button/button.svelte";
import Check from "@lucide/svelte/icons/check";

export default function Pricing_four($$renderer) {
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

	$$renderer.push(`<section class="py-16 md:py-32"><div class="mx-auto max-w-5xl px-6"><div class="mx-auto max-w-2xl space-y-6 text-center"><h1 class="text-center text-4xl font-semibold lg:text-5xl">Pricing that Scales with You</h1> <p>Gemini is evolving to be more than just the models. It supports an entire to the
				APIs and platforms helping developers and businesses innovate.</p></div> <div class="mt-8 grid gap-6 md:mt-20 md:grid-cols-5 md:gap-0"><div class="flex flex-col justify-between space-y-8 rounded-(--radius) border p-6 md:col-span-2 md:my-2 md:rounded-r-none md:border-r-0 lg:p-10"><div class="space-y-4"><div><h2 class="font-medium">Free</h2> <span class="my-3 block text-2xl font-semibold">$0 / mo</span> <p class="text-sm text-muted-foreground">Per editor</p></div> `);

	Button($$renderer, {
		href: '/',
		variant: 'outline',
		class: 'w-full',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Get Started`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <hr class="border-dashed"/> <ul class="list-outside space-y-3 text-sm"><!--[-->`);

	const each_array = $.ensure_array_like(pricingList.free);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		$$renderer.push(`<li class="flex items-center gap-2">`);
		Check($$renderer, { class: 'size-3' });
		$$renderer.push(`<!----> ${$.escape(item)}</li>`);
	}

	$$renderer.push(`<!--]--></ul></div></div> <div class="rounded-(--radius) border p-6 shadow-lg shadow-gray-950/5 md:col-span-3 lg:p-10 dark:bg-muted dark:[--color-muted:var(--color-zinc-900)]"><div class="grid gap-6 sm:grid-cols-2"><div class="space-y-4"><div><h2 class="font-medium">Pro</h2> <span class="my-3 block text-2xl font-semibold">$19 / mo</span> <p class="text-sm text-muted-foreground">Per editor</p></div> `);

	Button($$renderer, {
		href: '/',
		class: 'w-full',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Get Started`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div><div class="text-sm font-medium">Everything in free plus :</div> <ul class="mt-4 list-outside space-y-3 text-sm"><!--[-->`);

	const each_array_1 = $.ensure_array_like(pricingList.pro);

	for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
		let item = each_array_1[$$index_1];

		$$renderer.push(`<li class="flex items-center gap-2">`);
		Check($$renderer, { class: 'size-3' });
		$$renderer.push(`<!----> ${$.escape(item)}</li>`);
	}

	$$renderer.push(`<!--]--></ul></div></div></div></div></div></section>`);
}