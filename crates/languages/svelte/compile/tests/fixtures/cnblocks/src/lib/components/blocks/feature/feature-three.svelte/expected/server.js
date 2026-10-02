import * as $ from 'svelte/internal/server';
import { Card, CardContent, CardHeader } from "$lib/components/ui/card";
import Zap from "@lucide/svelte/icons/zap";
import Settings2 from "@lucide/svelte/icons/settings-2";
import Sparkles from "@lucide/svelte/icons/sparkles";
import CardDecorator from "./card-decorator.svelte";

export default function Feature_three($$renderer) {
	$$renderer.push(`<section class="bg-zinc-50 py-16 md:py-32 dark:bg-transparent"><div class="@container mx-auto max-w-5xl px-6"><div class="text-center"><h2 class="text-4xl font-semibold text-balance lg:text-5xl">Built to cover your needs</h2> <p class="mt-4">Libero sapiente aliquam quibusdam aspernatur, praesentium iusto repellendus.</p></div> `);

	Card($$renderer, {
		class: 'mx-auto mt-8 grid max-w-sm divide-y overflow-hidden shadow-zinc-950/5 *:text-center md:mt-16 @min-4xl:max-w-full @min-4xl:grid-cols-3 @min-4xl:divide-x @min-4xl:divide-y-0',
		children: ($$renderer) => {
			$$renderer.push(`<div class="group shadow-zinc-950/5">`);

			CardHeader($$renderer, {
				class: 'pb-3',
				children: ($$renderer) => {
					CardDecorator($$renderer, {
						children: ($$renderer) => {
							Zap($$renderer, { class: 'size-6', 'aria-hidden': true });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <h3 class="mt-6 font-medium">Customizable</h3>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardContent($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<p class="text-sm">Extensive customization options, allowing you to tailor every aspect to meet
						your specific needs.</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="group shadow-zinc-950/5">`);

			CardHeader($$renderer, {
				class: 'pb-3',
				children: ($$renderer) => {
					CardDecorator($$renderer, {
						children: ($$renderer) => {
							Settings2($$renderer, { class: 'size-6', 'aria-hidden': true });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <h3 class="mt-6 font-medium">You have full control</h3>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardContent($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<p class="mt-3 text-sm">From design elements to functionality, you have complete control to create a
						unique and personalized experience.</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="group shadow-zinc-950/5">`);

			CardHeader($$renderer, {
				class: 'pb-3',
				children: ($$renderer) => {
					CardDecorator($$renderer, {
						children: ($$renderer) => {
							Sparkles($$renderer, { class: 'size-6', 'aria-hidden': true });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <h3 class="mt-6 font-medium">Powered By AI</h3>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardContent($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<p class="mt-3 text-sm">Elements to functionality, you have complete control to create a unique
						experience.</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></section>`);
}