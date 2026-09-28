import * as $ from 'svelte/internal/server';
import { toast } from "svelte-sonner";
import { defaults, superForm } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import * as Form from "$lib/registry/ui/form/index.js";
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
import { z } from "zod";

const items = [
	{ id: "recents", label: "Recents" },
	{ id: "home", label: "Home" },
	{ id: "applications", label: "Applications" },
	{ id: "desktop", label: "Desktop" },
	{ id: "downloads", label: "Downloads" },
	{ id: "documents", label: "Documents" }
];

const formSchema = z.object({
	items: z.array(z.string()).refine((value) => value.some((item) => item), { message: "You have to select at least one item." })
});

export default function Checkbox_form_multiple($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		const form = superForm(defaults(zod4(formSchema)), {
			SPA: true,
			validators: zod4(formSchema),
			onUpdate: ({ form: f }) => {
				if (f.valid) {
					toast.success(`You submitted ${JSON.stringify(f.data, null, 2)}`);
				} else {
					toast.error("Please fix the errors in the form.");
				}
			}
		});

		const { form: formData, enhance } = form;

		function addItem(id) {
			$.store_mutate($$store_subs ??= {}, '$formData', formData, $.store_get($$store_subs ??= {}, '$formData', formData).items = [
				...$.store_get($$store_subs ??= {}, '$formData', formData).items,
				id
			]);
		}

		function removeItem(id) {
			$.store_mutate($$store_subs ??= {}, '$formData', formData, $.store_get($$store_subs ??= {}, '$formData', formData).items = $.store_get($$store_subs ??= {}, '$formData', formData).items.filter((i) => i !== id));
		}

		$$renderer.push(`<form method="POST" class="space-y-8">`);

		if (Form.Fieldset) {
			$$renderer.push('<!--[-->');

			Form.Fieldset($$renderer, {
				form,
				name: 'items',
				class: 'space-y-0',
				children: ($$renderer) => {
					$$renderer.push(`<div class="mb-4">`);

					if (Form.Legend) {
						$$renderer.push('<!--[-->');

						Form.Legend($$renderer, {
							class: 'text-base',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Sidebar`);
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
								$$renderer.push(`<!---->Select the items you want to display in the sidebar.`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</div> <div class="space-y-2"><!--[-->`);

					const each_array = $.ensure_array_like(items);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let item = each_array[$$index];
						const checked = $.store_get($$store_subs ??= {}, '$formData', formData).items.includes(item.id);

						$$renderer.push(`<div class="flex flex-row items-start space-x-3">`);

						{
							function children($$renderer, { props }) {
								Checkbox($$renderer, $.spread_props([
									props,
									{
										checked,
										value: item.id,
										onCheckedChange: (v) => {
											if (v) {
												addItem(item.id);
											} else {
												removeItem(item.id);
											}
										}
									}
								]));

								$$renderer.push(`<!----> `);

								if (Form.Label) {
									$$renderer.push('<!--[-->');

									Form.Label($$renderer, {
										class: 'font-normal',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(item.label)}`);
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
					}

					$$renderer.push(`<!--]--> `);

					if (Form.FieldErrors) {
						$$renderer.push('<!--[-->');
						Form.FieldErrors($$renderer, {});
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
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

		if (Form.Button) {
			$$renderer.push('<!--[-->');

			Form.Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Update display`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</form>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}