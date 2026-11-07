import * as $ from 'svelte/internal/server';
import { toast } from "svelte-sonner";
import { defaults, superForm } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import * as Form from "$lib/registry/ui/form/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import { z } from "zod";

const formSchema = z.object({
	email: z.email({ message: "Please select an email to display" })
});

export default function Select_form($$renderer, $$props) {
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
					name: 'email',
					children: ($$renderer) => {
						{
							function children($$renderer, { props }) {
								if (Form.Label) {
									$$renderer.push('<!--[-->');

									Form.Label($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Email`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Select.Root) {
									$$renderer.push('<!--[-->');

									Select.Root($$renderer, {
										type: 'single',
										name: props.name,
										get value() {
											return $.store_get($$store_subs ??= {}, '$formData', formData).email;
										},

										set value($$value) {
											$.store_mutate($$store_subs ??= {}, '$formData', formData, $.store_get($$store_subs ??= {}, '$formData', formData).email = $$value);
											$$settled = false;
										},

										children: ($$renderer) => {
											if (Select.Trigger) {
												$$renderer.push('<!--[-->');

												Select.Trigger($$renderer, $.spread_props([
													props,
													{
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$formData', formData).email
																? $.store_get($$store_subs ??= {}, '$formData', formData).email
																: "Select a verified email to display")}`);
														},
														$$slots: { default: true }
													}
												]));

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
															Select.Item($$renderer, { value: 'm@example.com', label: 'm@example.com' });
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Select.Item) {
															$$renderer.push('<!--[-->');
															Select.Item($$renderer, { value: 'm@google.com', label: 'm@google.com' });
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Select.Item) {
															$$renderer.push('<!--[-->');
															Select.Item($$renderer, { value: 'm@support.com', label: 'm@support.com' });
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
									$$renderer.push(`<!---->You can manage email address in your <a href="/examples/forms">email settings</a>.`);
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