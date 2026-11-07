import * as $ from 'svelte/internal/server';
import { toast } from "svelte-sonner";
import { defaults, superForm } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import * as Form from "$lib/registry/ui/form/index.js";
import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";
import { z } from "zod";

const formSchema = z.object({ type: z.enum(["all", "mentions", "none"]) });

export default function Radio_group_form($$renderer, $$props) {
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

			if (Form.Fieldset) {
				$$renderer.push('<!--[-->');

				Form.Fieldset($$renderer, {
					form,
					name: 'type',
					class: 'space-y-3',
					children: ($$renderer) => {
						if (Form.Legend) {
							$$renderer.push('<!--[-->');

							Form.Legend($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Notify me about...`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (RadioGroup.Root) {
							$$renderer.push('<!--[-->');

							RadioGroup.Root($$renderer, {
								class: 'flex flex-col space-y-1',
								name: 'type',
								get value() {
									return $.store_get($$store_subs ??= {}, '$formData', formData).type;
								},

								set value($$value) {
									$.store_mutate($$store_subs ??= {}, '$formData', formData, $.store_get($$store_subs ??= {}, '$formData', formData).type = $$value);
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<div class="flex items-center space-y-0 space-x-3">`);

									{
										function children($$renderer, { props }) {
											if (RadioGroup.Item) {
												$$renderer.push('<!--[-->');
												RadioGroup.Item($$renderer, $.spread_props([{ value: 'all' }, props]));
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Form.Label) {
												$$renderer.push('<!--[-->');

												Form.Label($$renderer, {
													class: 'font-normal',
													children: ($$renderer) => {
														$$renderer.push(`<!---->All new messages`);
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

									$$renderer.push(`</div> <div class="flex items-center space-y-0 space-x-3">`);

									{
										function children($$renderer, { props }) {
											if (RadioGroup.Item) {
												$$renderer.push('<!--[-->');
												RadioGroup.Item($$renderer, $.spread_props([{ value: 'mentions' }, props]));
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Form.Label) {
												$$renderer.push('<!--[-->');

												Form.Label($$renderer, {
													class: 'font-normal',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Direction messages and mentions`);
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

									$$renderer.push(`</div> <div class="flex items-center space-y-0 space-x-3">`);

									{
										function children($$renderer, { props }) {
											if (RadioGroup.Item) {
												$$renderer.push('<!--[-->');
												RadioGroup.Item($$renderer, $.spread_props([{ value: 'none' }, props]));
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Form.Label) {
												$$renderer.push('<!--[-->');

												Form.Label($$renderer, {
													class: 'font-normal',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Nothing`);
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

									$$renderer.push(`</div>`);
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