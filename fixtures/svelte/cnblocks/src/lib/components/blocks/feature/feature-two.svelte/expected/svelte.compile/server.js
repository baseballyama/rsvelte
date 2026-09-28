import * as $ from 'svelte/internal/server';
import { Card, CardContent, CardHeader } from "$lib/components/ui/card";
import Zap from "@lucide/svelte/icons/zap";
import Settings2 from "@lucide/svelte/icons/settings-2";
import Sparkles from "@lucide/svelte/icons/sparkles";
import CardDecorator from "./card-decorator.svelte";

export default function Feature_two($$renderer) {
	$$renderer.push(`<section class="py-16 md:py-32"><div class="@container mx-auto max-w-5xl px-6"><div class="text-center"><h2 class="text-4xl font-semibold text-balance lg:text-5xl">Built to cover your needs</h2> <p class="mt-4">Libero sapiente aliquam quibusdam aspernatur, praesentium iusto repellendus.</p></div> <div class="mx-auto mt-8 grid max-w-sm gap-6 [--color-background:var(--color-muted)] [--color-card:var(--color-muted)] *:text-center md:mt-16 @min-4xl:max-w-full @min-4xl:grid-cols-3 dark:[--color-muted:var(--color-zinc-900)]">`);

	Card($$renderer, {
		class: 'group border-0 shadow-none',
		children: ($$renderer) => {
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

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Card($$renderer, {
		class: 'group border-0 shadow-none',
		children: ($$renderer) => {
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

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Card($$renderer, {
		class: 'group border-0 shadow-none',
		children: ($$renderer) => {
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

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div></section>`);
}