import * as $ from 'svelte/internal/server';
import { toast } from "svelte-sonner";
import { defaults, superForm } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import * as Form from "$lib/registry/ui/form/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";
import { z } from "zod";

const formSchema = z.object({
	bio: z.string().min(10, "Bio must be at least 10 characters.").max(160, "Bio must be at most 160 characters.")
});

export default function Textarea_form($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		const form = superForm(defaults(zod4(formSchema)), {
			validators: zod4(formSchema),
			SPA: true,
			onUpdate: ({ form: f }) => {
				if (f.valid) {
					toast.success(`You submitted ${JSON.stringify(f.data, null, 2)}`);
				} else {
					toast.error("Please fix the errors in the form.");
				}
			}
		});

		const { form: formData, enhance } = form;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<form method="POST" class="w-2/3 space-y-6">`);

			if (Form.Field) {
				$$renderer.push('<!--[-->');

				Form.Field($$renderer, {
					form,
					name: 'bio',
					children: ($$renderer) => {
						{
							function children($$renderer, { props }) {
								if (Form.Label) {
									$$renderer.push('<!--[-->');

									Form.Label($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Bio`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								Textarea($$renderer, $.spread_props([
									props,
									{
										placeholder: 'Tell us a little bit about yourself',
										class: 'resize-none',
										get value() {
											return $.store_get($$store_subs ??= {}, '$formData', formData).bio;
										},

										set value($$value) {
											$.store_mutate($$store_subs ??= {}, '$formData', formData, $.store_get($$store_subs ??= {}, '$formData', formData).bio = $$value);
											$$settled = false;
										}
									}
								]));

								$$renderer.push(`<!----> `);

								if (Form.Description) {
									$$renderer.push('<!--[-->');

									Form.Description($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->You can <span>@mention</span> other users and organizations.`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}

							if (Form.Control) {
								$$renderer.push('<!--[-->');
								Form.Control($$renderer, { children, $$slots: { default: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (Form.FieldErrors) {
							$$renderer.push('<!--[-->');
							Form.FieldErrors($$renderer, {});
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

			if (Form.Button) {
				$$renderer.push('<!--[-->');

				Form.Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Submit`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</form>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}