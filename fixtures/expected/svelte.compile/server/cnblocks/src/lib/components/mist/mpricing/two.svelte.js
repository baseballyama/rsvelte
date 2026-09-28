import * as $ from 'svelte/internal/server';
import { Card, CardHeader, CardTitle, CardDescription } from "$lib/components/ui/card";
import Button from "$lib/components/ui/button/button.svelte";
import Check from "@lucide/svelte/icons/check";

export default function Two($$renderer) {
	$$renderer.push(`<div class="relative bg-muted py-16 [--color-primary:var(--color-indigo-500)] md:py-32 dark:bg-muted/30"><div class="mx-auto max-w-5xl px-6"><div class="mx-auto max-w-2xl text-center"><h2 class="text-3xl font-bold text-balance md:text-4xl lg:text-5xl">Pricing that scale with your business</h2> <p class="mx-auto mt-4 max-w-xl text-lg text-balance text-muted-foreground">Choose the perfect plan for your needs and start optimizing your workflow today</p></div> <div class="@container relative mt-12 md:mt-20">`);

	Card($$renderer, {
		class: 'relative mx-auto max-w-sm @4xl:max-w-full',
		children: ($$renderer) => {
			$$renderer.push(`<div class="grid @4xl:grid-cols-3"><div>`);

			CardHeader($$renderer, {
				class: 'p-8',
				children: ($$renderer) => {
					CardTitle($$renderer, {
						class: 'font-medium',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Free`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <span class="mt-2 mb-0.5 block text-2xl font-semibold">$0 / mo</span> `);

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

			$$renderer.push(`<!----> <div class="border-y px-8 py-4">`);

			Button($$renderer, {
				class: 'w-full',
				variant: 'neutral',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Get Started`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <ul role="list" class="space-y-3 p-8"><!--[-->`);

			const each_array = $.ensure_array_like([
				"Basic Analytics Dashboard",
				"5GB Cloud Storage",
				"Email and Chat Support"
			]);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];

				$$renderer.push(`<li class="flex items-center gap-2">`);
				Check($$renderer, { class: 'size-3 text-primary', strokeWidth: 3.5 });
				$$renderer.push(`<!----> ${$.escape(item)}</li>`);
			}

			$$renderer.push(`<!--]--></ul></div> <div class="-mx-1 rounded-(--radius) bg-background shadow ring-1 @3xl:mx-0 @3xl:-my-3 dark:border-x"><div class="relative px-1 @3xl:px-0 @3xl:py-3">`);

			CardHeader($$renderer, {
				class: 'p-8',
				children: ($$renderer) => {
					CardTitle($$renderer, {
						class: 'font-medium',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Pro`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <span class="mt-2 mb-0.5 block text-2xl font-semibold">$19 / mo</span> `);

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

			$$renderer.push(`<!----> <div class="-mx-1 border-y px-8 py-4 @3xl:mx-0">`);

			Button($$renderer, {
				variant: 'mdefault',
				class: 'w-full',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Get Started`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <ul role="list" class="space-y-3 p-8"><!--[-->`);

			const each_array_1 = $.ensure_array_like([
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
			]);

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let item = each_array_1[$$index_1];

				$$renderer.push(`<li class="flex items-center gap-2">`);
				Check($$renderer, { class: 'size-3 text-primary', strokeWidth: 3.5 });
				$$renderer.push(`<!----> ${$.escape(item)}</li>`);
			}

			$$renderer.push(`<!--]--></ul></div></div> <div>`);

			CardHeader($$renderer, {
				class: 'p-8',
				children: ($$renderer) => {
					CardTitle($$renderer, {
						class: 'font-medium',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Pro Plus`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <span class="mt-2 mb-0.5 block text-2xl font-semibold">$49 / mo</span> `);

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

			$$renderer.push(`<!----> <div class="border-y px-8 py-4">`);

			Button($$renderer, {
				class: 'w-full',
				variant: 'neutral',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Get Started`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <ul role="list" class="space-y-3 p-8"><!--[-->`);

			const each_array_2 = $.ensure_array_like([
				"Everything in Pro Plan",
				"5GB Cloud Storage",
				"Email and Chat Support"
			]);

			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let item = each_array_2[$$index_2];

				$$renderer.push(`<li class="flex items-center gap-2">`);
				Check($$renderer, { class: 'size-3 text-primary', strokeWidth: 3.5 });
				$$renderer.push(`<!----> ${$.escape(item)}</li>`);
			}

			$$renderer.push(`<!--]--></ul></div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div></div>`);
}