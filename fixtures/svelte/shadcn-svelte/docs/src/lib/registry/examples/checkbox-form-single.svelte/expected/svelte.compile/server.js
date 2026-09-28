import * as $ from 'svelte/internal/server';
import { toast } from "svelte-sonner";
import { defaults, superForm } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import * as Form from "$lib/registry/ui/form/index.js";
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
import { z } from "zod";

const formSchema = z.object({ mobile: z.boolean().default(false) });

export default function Checkbox_form_single($$renderer, $$props) {
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
			$$renderer.push(`<form method="POST" class="space-y-6">`);

			if (Form.Field) {
				$$renderer.push('<!--[-->');

				Form.Field($$renderer, {
					form,
					name: 'mobile',
					class: 'flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4',
					children: ($$renderer) => {
						{
							function children($$renderer, { props }) {
								Checkbox($$renderer, $.spread_props([
									props,
									{
										get checked() {
											return $.store_get($$store_subs ??= {}, '$formData', formData).mobile;
										},

										set checked($$value) {
											$.store_mutate($$store_subs ??= {}, '$formData', formData, $.store_get($$store_subs ??= {}, '$formData', formData).mobile = $$value);
											$$settled = false;
										}
									}
								]));

								$$renderer.push(`<!----> <div class="space-y-1 leading-none">`);

								if (Form.Label) {
									$$renderer.push('<!--[-->');

									Form.Label($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Use different settings for my mobile devices`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Form.Description) {
									$$renderer.push('<!--[-->');

									Form.Description($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->You can manage your mobile notifications in the <a href="/examples/forms">mobile settings</a> page.`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(`</div>`);
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