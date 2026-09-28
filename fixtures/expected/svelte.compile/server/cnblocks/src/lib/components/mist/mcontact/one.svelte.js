import * as $ from 'svelte/internal/server';
import Button from "$lib/components/ui/button/button.svelte";
import Card from "$lib/components/ui/card/card.svelte";
import Input from "$lib/components/ui/input/input.svelte";
import Label from "$lib/components/ui/label/label.svelte";
import { Select, SelectContent, SelectItem, SelectTrigger } from "$lib/components/ui/select";
import Textarea from "$lib/components/ui/textarea/textarea.svelte";

export default function One($$renderer) {
	$$renderer.push(`<section class="bg-muted py-15 [--color-primary:var(--color-indigo-500)] sm:py-24 lg:py-32 dark:bg-muted/30"><div class="mx-auto max-w-4xl px-4 lg:px-0"><h1 class="text-4xl font-semibold lg:text-5xl">Help us route your inquiry</h1> <p class="mt-4 text-lg text-muted-foreground">We'll help you find the right plan and pricing for your business.</p> <div class="mt-12 grid gap-12 lg:grid-cols-5"><div class="grid grid-cols-2 lg:col-span-2 lg:block lg:space-y-12"><div class="flex flex-col justify-between space-y-6"><div><h2 class="mb-3 text-lg font-semibold">Collaborate</h2> <a href="mailto:hello@tailus.com" class="text-lg text-primary hover:underline">hello@tailark.com</a> <p class="mt-3 text-sm">+243 000 000 000</p></div></div> <div class="flex flex-col justify-between space-y-6"><div><h3 class="mb-3 text-lg font-semibold">Press</h3> <a href="mailto:press@tailark.com" class="text-lg text-primary hover:underline">press@tailark.com</a> <p class="mt-3 text-sm">+243 000 000 000</p></div></div></div> <form action="" class="@container lg:col-span-3">`);

	Card($$renderer, {
		class: 'p-8 sm:p-12',
		children: ($$renderer) => {
			$$renderer.push(`<h3 class="text-xl font-semibold">Let's get you to the right place</h3> <p class="mt-4 text-sm">Reach out to our sales team! We’re eager to learn more about how you plan to
						use our application.</p> <div class="mt-12 space-y-6 *:space-y-3 **:[&amp;>label]:block"><div class="grid gap-3 *:space-y-3 @md:grid-cols-2"><div>`);

			Label($$renderer, {
				for: 'name',
				class: 'space-y-2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Full name`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);
			Input($$renderer, { type: 'text', id: 'name', placeholder: 'Your name' });
			$$renderer.push(`<!----></div> <div>`);

			Label($$renderer, {
				for: 'email',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Work Email`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				type: 'email',
				id: 'email',
				required: true,
				placeholder: 'Your email'
			});

			$$renderer.push(`<!----></div></div> <div>`);

			Label($$renderer, {
				for: 'country',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Country/Region`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Select($$renderer, {
				type: 'single',
				children: ($$renderer) => {
					SelectTrigger($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Select a country`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					SelectContent($$renderer, {
						children: ($$renderer) => {
							SelectItem($$renderer, {
								value: '1',
								children: ($$renderer) => {
									$$renderer.push(`<!---->DR Congo`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							SelectItem($$renderer, {
								value: '2',
								children: ($$renderer) => {
									$$renderer.push(`<!---->United States`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							SelectItem($$renderer, {
								value: '3',
								children: ($$renderer) => {
									$$renderer.push(`<!---->France`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="grid gap-3 *:space-y-3 @md:grid-cols-2"><div>`);

			Label($$renderer, {
				for: 'website',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Company Website`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);
			Input($$renderer, { type: 'url', id: 'website', placeholder: 'Your website' });
			$$renderer.push(`<!----></div> <div>`);

			Label($$renderer, {
				for: 'job',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Job function`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Select($$renderer, {
				type: 'single',
				children: ($$renderer) => {
					SelectTrigger($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Select a job function`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					SelectContent($$renderer, {
						children: ($$renderer) => {
							SelectItem($$renderer, {
								value: '1',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Finance`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							SelectItem($$renderer, {
								value: '2',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Education`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							SelectItem($$renderer, {
								value: '3',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Legal`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							SelectItem($$renderer, {
								value: '4',
								children: ($$renderer) => {
									$$renderer.push(`<!---->More`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div> <div>`);

			Label($$renderer, {
				for: 'msg',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Message`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);
			Textarea($$renderer, { id: 'msg', rows: 3, placeholder: 'Enter your message' });
			$$renderer.push(`<!----></div> `);

			Button($$renderer, {
				variant: 'mdefault',
				size: 'default',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Submit`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></form></div></div></section>`);
}