import * as $ from 'svelte/internal/server';
import Button from "$lib/components/ui/button/button.svelte";
import { Card } from "$lib/components/ui/card";
import Input from "$lib/components/ui/input/input.svelte";
import Label from "$lib/components/ui/label/label.svelte";
import * as Select from "$lib/components/ui/select/index.js";
import { Textarea } from "$lib/components/ui/textarea";

export default function Contact_two($$renderer) {
	$$renderer.push(`<section class="py-32"><div class="mx-auto max-w-4xl px-4 lg:px-0"><h1 class="mb-12 text-center text-4xl font-semibold lg:text-5xl">Help us route your inquiry</h1> <div class="grid divide-y border md:grid-cols-2 md:gap-4 md:divide-x md:divide-y-0"><div class="flex flex-col justify-between space-y-8 p-6 sm:p-12"><div><h2 class="mb-3 text-lg font-semibold">Collaborate</h2> <a href="mailto:hello@tailus.io" class="text-lg text-blue-600 hover:underline dark:text-blue-400">hello@tailus.io</a> <p class="mt-3 text-sm">+243 000 000 000</p></div></div> <div class="flex flex-col justify-between space-y-8 p-6 sm:p-12"><div><h3 class="mb-3 text-lg font-semibold">Press</h3> <a href="mailto:press@tailus.io" class="text-lg text-blue-600 hover:underline dark:text-blue-400">press@tailus.io</a> <p class="mt-3 text-sm">+243 000 000 000</p></div></div></div> <div class="h-3 border-x bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_6px)]"></div> <form action="" class="border px-4 py-12 lg:px-0 lg:py-24">`);

	Card($$renderer, {
		class: 'mx-auto max-w-lg p-8 sm:p-16',
		children: ($$renderer) => {
			$$renderer.push(`<h3 class="text-xl font-semibold">Let's get you to the right place</h3> <p class="mt-4 text-sm">Reach out to our sales team! We’re eager to learn more about how you plan to use
					our application.</p> <div class="mt-12 space-y-6 *:space-y-3 **:[&amp;>label]:block"><div>`);

			Label($$renderer, {
				for: 'name',
				class: 'space-y-2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Full name`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				type: 'text',
				id: 'name',
				placeholder: 'John Doe',
				required: true
			});

			$$renderer.push(`<!----></div> <div>`);

			Label($$renderer, {
				for: 'email',
				class: 'space-y-2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Work Email`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				type: 'email',
				id: 'email',
				placeholder: 'you@company.com',
				required: true
			});

			$$renderer.push(`<!----></div> <div>`);

			Label($$renderer, {
				for: 'country',
				class: 'space-y-2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Country/Region`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (Select.Root) {
				$$renderer.push('<!--[-->');

				Select.Root($$renderer, {
					type: 'single',
					children: ($$renderer) => {
						if (Select.Trigger) {
							$$renderer.push('<!--[-->');

							Select.Trigger($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Select a country`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Select.Content) {
							$$renderer.push('<!--[-->');

							Select.Content($$renderer, {
								children: ($$renderer) => {
									if (Select.Item) {
										$$renderer.push('<!--[-->');

										Select.Item($$renderer, {
											value: '1',
											children: ($$renderer) => {
												$$renderer.push(`<!---->DR Congo`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Select.Item) {
										$$renderer.push('<!--[-->');

										Select.Item($$renderer, {
											value: '2',
											children: ($$renderer) => {
												$$renderer.push(`<!---->United States`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Select.Item) {
										$$renderer.push('<!--[-->');

										Select.Item($$renderer, {
											value: '3',
											children: ($$renderer) => {
												$$renderer.push(`<!---->France`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div> <div>`);

			Label($$renderer, {
				for: 'website',
				class: 'space-y-2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Company Website`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				type: 'url',
				id: 'website',
				placeholder: 'https://company.com'
			});

			$$renderer.push(`<!----></div> <div>`);

			Label($$renderer, {
				for: 'job',
				class: 'space-y-2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Job function`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (Select.Root) {
				$$renderer.push('<!--[-->');

				Select.Root($$renderer, {
					type: 'single',
					children: ($$renderer) => {
						if (Select.Trigger) {
							$$renderer.push('<!--[-->');

							Select.Trigger($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Select job function`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Select.Content) {
							$$renderer.push('<!--[-->');

							Select.Content($$renderer, {
								children: ($$renderer) => {
									if (Select.Item) {
										$$renderer.push('<!--[-->');

										Select.Item($$renderer, {
											value: '1',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Finance`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Select.Item) {
										$$renderer.push('<!--[-->');

										Select.Item($$renderer, {
											value: '2',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Education`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Select.Item) {
										$$renderer.push('<!--[-->');

										Select.Item($$renderer, {
											value: '3',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Legal`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Select.Item) {
										$$renderer.push('<!--[-->');

										Select.Item($$renderer, {
											value: '4',
											children: ($$renderer) => {
												$$renderer.push(`<!---->More`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div> <div>`);

			Label($$renderer, {
				for: 'msg',
				class: 'space-y-2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Message`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Textarea($$renderer, {
				id: 'msg',
				rows: 3,
				placeholder: 'Tell us about your needs...'
			});

			$$renderer.push(`<!----></div> `);

			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Submit`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></form></div></section>`);
}