import * as $ from 'svelte/internal/server';
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

export default function Pricing_two($$renderer) {
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

	$$renderer.push(`<section class="py-16 md:py-32"><div class="mx-auto max-w-6xl px-6"><div class="mx-auto max-w-2xl space-y-6 text-center"><h1 class="text-center text-4xl font-semibold lg:text-5xl">Pricing that Scales with You</h1> <p>Gemini is evolving to be more than just the models. It supports an entire to the
				APIs and platforms helping developers and businesses innovate.</p></div> <div class="mt-8 grid gap-6 [--color-card:var(--color-muted)] *:border-none *:shadow-none md:mt-20 md:grid-cols-3 dark:[--color-muted:var(--color-zinc-900)]">`);

	Card($$renderer, {
		class: 'flex flex-col',
		children: ($$renderer) => {
			CardHeader($$renderer, {
				children: ($$renderer) => {
					CardTitle($$renderer, {
						class: 'font-medium',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Free`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <span class="my-3 block text-2xl font-semibold">$0 / mo</span> `);

					CardDescription($$renderer, {
						class: 'text-sm',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Per editor`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardContent($$renderer, {
				class: 'space-y-4',
				children: ($$renderer) => {
					$$renderer.push(`<hr class="border-dashed"/> <ul class="list-outside space-y-3 text-sm"><!--[-->`);

					const each_array = $.ensure_array_like(pricingList.free);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let item = each_array[$$index];

						$$renderer.push(`<li class="flex items-center gap-2">`);
						Check($$renderer, { class: 'size-3' });
						$$renderer.push(`<!----> ${$.escape(item)}</li>`);
					}

					$$renderer.push(`<!--]--></ul>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardFooter($$renderer, {
				class: 'mt-auto',
				children: ($$renderer) => {
					Button($$renderer, {
						variant: 'outline',
						class: 'w-full',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Get Started`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Card($$renderer, {
		class: 'relative',
		children: ($$renderer) => {
			$$renderer.push(`<span class="absolute inset-x-0 -top-3 mx-auto flex h-6 w-fit items-center rounded-full bg-linear-to-br/increasing from-purple-400 to-amber-300 px-3 py-1 text-xs font-medium text-amber-950 ring-1 ring-white/20 ring-offset-1 ring-offset-gray-950/5 ring-inset">Popular</span> <div class="flex flex-col">`);

			CardHeader($$renderer, {
				children: ($$renderer) => {
					CardTitle($$renderer, {
						class: 'font-medium',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Pro`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <span class="my-3 block text-2xl font-semibold">$19 / mo</span> `);

					CardDescription($$renderer, {
						class: 'text-sm',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Per editor`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardContent($$renderer, {
				class: 'space-y-4',
				children: ($$renderer) => {
					$$renderer.push(`<hr class="border-dashed"/> <ul class="list-outside space-y-3 text-sm"><!--[-->`);

					const each_array_1 = $.ensure_array_like(pricingList.pro);

					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
						let item = each_array_1[$$index_1];

						$$renderer.push(`<li class="flex items-center gap-2">`);
						Check($$renderer, { class: 'size-3' });
						$$renderer.push(`<!----> ${$.escape(item)}</li>`);
					}

					$$renderer.push(`<!--]--></ul>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardFooter($$renderer, {
				children: ($$renderer) => {
					Button($$renderer, {
						class: 'w-full',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Get Started`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Card($$renderer, {
		class: 'flex flex-col',
		children: ($$renderer) => {
			CardHeader($$renderer, {
				children: ($$renderer) => {
					CardTitle($$renderer, {
						class: 'font-medium',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Startup`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <span class="my-3 block text-2xl font-semibold">$29 / mo</span> `);

					CardDescription($$renderer, {
						class: 'text-sm',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Per editor`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardContent($$renderer, {
				class: 'space-y-4',
				children: ($$renderer) => {
					$$renderer.push(`<hr class="border-dashed"/> <ul class="list-outside space-y-3 text-sm"><!--[-->`);

					const each_array_2 = $.ensure_array_like(pricingList.startup);

					for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
						let item = each_array_2[$$index_2];

						$$renderer.push(`<li class="flex items-center gap-2">`);
						Check($$renderer, { class: 'size-3' });
						$$renderer.push(`<!----> ${$.escape(item)}</li>`);
					}

					$$renderer.push(`<!--]--></ul>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardFooter($$renderer, {
				class: 'mt-auto',
				children: ($$renderer) => {
					Button($$renderer, {
						variant: 'outline',
						class: 'w-full',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Get Started`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div></section>`);
}