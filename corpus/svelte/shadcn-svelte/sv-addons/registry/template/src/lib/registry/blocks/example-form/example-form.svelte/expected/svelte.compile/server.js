import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";
import { z } from "zod";

export default function Example_form($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const exampleFormSchema = z.object({
			name: z.string().min(1),
			email: z.string().email(),
			message: z.string().min(1)
		});

		let pending = false;

		let formState = {
			defaultValues: { name: "", email: "", message: "" },
			success: false,
			errors: { name: "", email: "", message: "" }
		};

		const handleSubmit = (e) => {
			e.preventDefault();
			pending = true;

			const formData = new FormData(e.currentTarget);
			const data = Object.fromEntries(formData);
			const result = exampleFormSchema.safeParse(data);

			if (!result.success) {
				formState = {
					...formState,
					errors: Object.fromEntries(Object.entries(result.error.flatten().fieldErrors).map(([key, value]) => [key, value?.[0] ?? ""]))
				};

				pending = false;

				return;
			}

			pending = false;
		};

		$$renderer.push(`<form class="w-full max-w-sm">`);

		if (Card.Root) {
			$$renderer.push('<!--[-->');

			Card.Root($$renderer, {
				children: ($$renderer) => {
					if (Card.Header) {
						$$renderer.push('<!--[-->');

						Card.Header($$renderer, {
							children: ($$renderer) => {
								if (Card.Title) {
									$$renderer.push('<!--[-->');

									Card.Title($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->How can we help?`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Card.Description) {
									$$renderer.push('<!--[-->');

									Card.Description($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Need help with your project? We're here to assist you.`);
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

					$$renderer.push(` `);

					if (Card.Content) {
						$$renderer.push('<!--[-->');

						Card.Content($$renderer, {
							class: 'flex flex-col gap-6',
							children: ($$renderer) => {
								$$renderer.push(`<div class="group/field grid gap-2"${$.attr('data-invalid', !!formState.errors?.name)}>`);

								Label($$renderer, {
									for: 'name',
									class: 'group-data-[invalid=true]/field:text-destructive',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Name <span aria-hidden="true">*</span>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Input($$renderer, {
									id: 'name',
									name: 'name',
									placeholder: 'Lee Robinson',
									class: 'group-data-[invalid=true]/field:border-destructive focus-visible:group-data-[invalid=true]/field:ring-destructive',
									disabled: pending,
									'aria-invalid': !!formState.errors?.name,
									'aria-errormessage': 'error-name',
									defaultValue: formState.defaultValues.name
								});

								$$renderer.push(`<!----> `);

								if (formState.errors.name) {
									$$renderer.push(`<!--[0--><p id="error-name" class="text-destructive text-sm">${$.escape(formState.errors.name)}</p>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--></div> <div class="group/field grid gap-2"${$.attr('data-invalid', !!formState.errors?.email)}>`);

								Label($$renderer, {
									for: 'email',
									class: 'group-data-[invalid=true]/field:text-destructive',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Email <span aria-hidden="true">*</span>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Input($$renderer, {
									id: 'email',
									name: 'email',
									placeholder: 'leerob@acme.com',
									class: 'group-data-[invalid=true]/field:border-destructive focus-visible:group-data-[invalid=true]/field:ring-destructive',
									disabled: pending,
									'aria-invalid': !!formState.errors?.email,
									'aria-errormessage': 'error-email',
									defaultValue: formState.defaultValues.email
								});

								$$renderer.push(`<!----> `);

								if (formState.errors.email) {
									$$renderer.push(`<!--[0--><p id="error-email" class="text-destructive text-sm">${$.escape(formState.errors.email)}</p>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--></div> <div class="group/field grid gap-2"${$.attr('data-invalid', !!formState.errors?.message)}>`);

								Label($$renderer, {
									for: 'message',
									class: 'group-data-[invalid=true]/field:text-destructive',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Message <span aria-hidden="true">*</span>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Textarea($$renderer, {
									id: 'message',
									name: 'message',
									placeholder: 'Type your message here...',
									class: 'group-data-[invalid=true]/field:border-destructive focus-visible:group-data-[invalid=true]/field:ring-destructive',
									disabled: pending,
									'aria-invalid': !!formState.errors?.message,
									'aria-errormessage': 'error-message',
									defaultValue: formState.defaultValues.message
								});

								$$renderer.push(`<!----> `);

								if (formState.errors.message) {
									$$renderer.push(`<!--[0--><p id="error-message" class="text-destructive text-sm">${$.escape(formState.errors.message)}</p>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--></div>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Card.Footer) {
						$$renderer.push('<!--[-->');

						Card.Footer($$renderer, {
							children: ($$renderer) => {
								Button($$renderer, {
									type: 'submit',
									size: 'sm',
									disabled: pending,
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(pending ? "Sending..." : "Send Message")}`);
									},
									$$slots: { default: true }
								});
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

		$$renderer.push(`</form>`);
	});
}