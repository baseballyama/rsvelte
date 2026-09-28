import * as $ from 'svelte/internal/server';
import { Button } from "$lib/components/ui/veil/button";
import { Card } from "$lib/components/ui/veil/card";
import { Input } from "$lib/components/ui/veil/input";
import { Label } from "$lib/components/ui/label";
import * as Select from "$lib/components/ui/select";
import { Textarea } from "$lib/components/ui/veil/textarea";

export default function Contact_two($$renderer) {
	$$renderer.push(`<section class="@container bg-background py-24"><div class="mx-auto max-w-2xl px-6"><div class="text-center"><h1 class="font-serif text-4xl font-medium text-balance sm:text-5xl">Contact Sales</h1> <p class="mx-auto mt-4 max-w-md text-balance text-muted-foreground">Ready to get started? Our team will help you find the right plan for your business.</p></div> `);

	Card($$renderer, {
		variant: 'outline',
		class: 'mt-12 p-8',
		children: ($$renderer) => {
			$$renderer.push(`<form action="" class="space-y-5"><div class="grid gap-4 @md:grid-cols-2"><div class="space-y-2">`);

			Label($$renderer, {
				for: 'firstName',
				class: 'text-sm',
				children: ($$renderer) => {
					$$renderer.push(`<!---->First name`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				type: 'text',
				id: 'firstName',
				name: 'firstName',
				placeholder: 'John',
				required: true
			});

			$$renderer.push(`<!----></div> <div class="space-y-2">`);

			Label($$renderer, {
				for: 'lastName',
				class: 'text-sm',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Last name`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				type: 'text',
				id: 'lastName',
				name: 'lastName',
				placeholder: 'Doe',
				required: true
			});

			$$renderer.push(`<!----></div></div> <div class="space-y-2">`);

			Label($$renderer, {
				for: 'email',
				class: 'text-sm',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Work email`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				type: 'email',
				id: 'email',
				name: 'email',
				placeholder: 'you@company.com',
				required: true
			});

			$$renderer.push(`<!----></div> <div class="space-y-2">`);

			Label($$renderer, {
				for: 'company',
				class: 'text-sm',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Company`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				type: 'text',
				id: 'company',
				name: 'company',
				placeholder: 'Acme Inc.'
			});

			$$renderer.push(`<!----></div> <div class="grid gap-4 @md:grid-cols-2"><div class="space-y-2">`);

			Label($$renderer, {
				for: 'size',
				class: 'text-sm',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Company size`);
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
								class: 'h-8 bg-card shadow-none ring-input focus-visible:ring-ring/15 dark:bg-transparent',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Select`);
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
								class: 'rounded-xl border-transparent ring-1 ring-border',
								children: ($$renderer) => {
									if (Select.Item) {
										$$renderer.push('<!--[-->');

										Select.Item($$renderer, {
											value: '1-10',
											children: ($$renderer) => {
												$$renderer.push(`<!---->1-10 employees`);
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
											value: '11-50',
											children: ($$renderer) => {
												$$renderer.push(`<!---->11-50 employees`);
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
											value: '51-200',
											children: ($$renderer) => {
												$$renderer.push(`<!---->51-200 employees`);
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
											value: '201-500',
											children: ($$renderer) => {
												$$renderer.push(`<!---->201-500 employees`);
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
											value: '500+',
											children: ($$renderer) => {
												$$renderer.push(`<!---->500+ employees`);
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

			$$renderer.push(`</div> <div class="space-y-2">`);

			Label($$renderer, {
				for: 'interest',
				class: 'text-sm',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Interest`);
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
								class: 'h-8 bg-card shadow-none ring-input focus-visible:ring-ring/15 dark:bg-transparent',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Select`);
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
								class: 'rounded-xl border-transparent ring-1 ring-border',
								children: ($$renderer) => {
									if (Select.Item) {
										$$renderer.push('<!--[-->');

										Select.Item($$renderer, {
											value: 'pricing',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Pricing`);
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
											value: 'demo',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Product demo`);
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
											value: 'partnership',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Partnership`);
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
											value: 'other',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Other`);
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

			$$renderer.push(`</div></div> <div class="space-y-2">`);

			Label($$renderer, {
				for: 'message',
				class: 'text-sm',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Message`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Textarea($$renderer, {
				id: 'message',
				name: 'message',
				rows: 5,
				placeholder: 'Tell us about your needs...',
				class: 'min-h-28'
			});

			$$renderer.push(`<!----></div> `);

			Button($$renderer, {
				class: 'w-full',
				type: 'submit',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Submit`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></form>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <p class="mt-6 text-center text-sm text-muted-foreground">By submitting, you agree to our <a href="/" class="text-foreground underline">Privacy Policy</a></p></div></section>`);
}