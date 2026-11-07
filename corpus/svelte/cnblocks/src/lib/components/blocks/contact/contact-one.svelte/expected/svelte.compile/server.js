import * as $ from 'svelte/internal/server';
import Button from "$lib/components/ui/button/button.svelte";
import { Card } from "$lib/components/ui/card";
import Input from "$lib/components/ui/input/input.svelte";
import Label from "$lib/components/ui/label/label.svelte";
import * as Select from "$lib/components/ui/select/index.js";
import { Textarea } from "$lib/components/ui/textarea";

export default function Contact_one($$renderer) {
	$$renderer.push(`<section class="py-32"><div class="mx-auto max-w-3xl px-8 lg:px-0"><h1 class="text-center text-4xl font-semibold lg:text-5xl">Contact Sales</h1> <p class="mt-4 text-center">We'll help you find the right plan and pricing for your business.</p> `);

	Card($$renderer, {
		class: 'mx-auto mt-12 max-w-lg p-8 shadow-md sm:p-16',
		children: ($$renderer) => {
			$$renderer.push(`<div><h2 class="text-xl font-semibold">Let's get you to the right place</h2> <p class="mt-4 text-sm">Reach out to our sales team! We're eager to learn more about how you plan to use
					our application.</p></div> <form action="" class="mt-12 space-y-6 *:space-y-3 **:[&amp;>label]:block"><div>`);

			Label($$renderer, {
				for: 'name',
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
									$$renderer.push(`<!---->Select Country/Region`);
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

			$$renderer.push(`<!----> <span class="inline-block text-sm text-muted-foreground">Must start with 'https'</span></div> <div>`);

			Label($$renderer, {
				for: 'job',
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
									$$renderer.push(`<!---->Select Job Function`);
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

			$$renderer.push(`<!----></form>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></section>`);
}