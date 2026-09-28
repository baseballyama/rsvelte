import * as $ from 'svelte/internal/server';
import { toast } from "svelte-sonner";
import { defaults, superForm } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import * as Form from "$lib/registry/ui/form/index.js";
import * as InputOTP from "$lib/registry/ui/input-otp/index.js";
import { z } from "zod";

const formSchema = z.object({
	pin: z.string().min(6, {
		message: "Your one-time password must be at least 6 characters."
	})
});

export default function Input_otp_form($$renderer, $$props) {
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
					name: 'pin',
					children: ($$renderer) => {
						{
							function children($$renderer, { props }) {
								if (Form.Label) {
									$$renderer.push('<!--[-->');

									Form.Label($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->One-Time Password`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								{
									function children($$renderer, { cells }) {
										if (InputOTP.Group) {
											$$renderer.push('<!--[-->');

											InputOTP.Group($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!--[-->`);

													const each_array = $.ensure_array_like(cells);

													for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
														let cell = each_array[$$index];

														if (InputOTP.Slot) {
															$$renderer.push('<!--[-->');
															InputOTP.Slot($$renderer, { cell });
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													}

													$$renderer.push(`<!--]-->`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}

									if (InputOTP.Root) {
										$$renderer.push('<!--[-->');

										InputOTP.Root($$renderer, $.spread_props([
											{ maxlength: 6 },
											props,
											{
												get value() {
													return $.store_get($$store_subs ??= {}, '$formData', formData).pin;
												},

												set value($$value) {
													$.store_mutate($$store_subs ??= {}, '$formData', formData, $.store_get($$store_subs ??= {}, '$formData', formData).pin = $$value);
													$$settled = false;
												},
												children,
												$$slots: { default: true }
											}
										]));

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
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

						if (Form.Description) {
							$$renderer.push('<!--[-->');

							Form.Description($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Please enter the one-time password sent to your phone.`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
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