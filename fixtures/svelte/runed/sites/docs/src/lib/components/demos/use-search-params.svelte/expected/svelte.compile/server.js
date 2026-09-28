import * as $ from 'svelte/internal/server';
import { useSearchParams, createSearchParamsSchema } from "runed/kit";
import { Button, DemoContainer, Input } from "@svecodocs/kit";

export default function Use_search_params($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const params = useSearchParams(createSearchParamsSchema({ fields: { type: "object", default: {}, objectType: {} } }));
		const newField = { key: "", value: "" };

		function addField() {
			if (newField.key.trim() && newField.value.trim()) {
				params.fields = { ...params.fields, [newField.key]: newField.value };
				newField.key = "";
				newField.value = "";
			}
		}

		function removeField(key) {
			const newFields = { ...params.fields };

			delete newFields[key];
			params.fields = newFields;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			DemoContainer($$renderer, {
				class: 'flex flex-col gap-4',
				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(Object.entries(params.fields));

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let [key, _value] = each_array[$$index];

						$$renderer.push(`<div class="flex items-center gap-3">`);

						Input($$renderer, {
							class: 'flex-1',
							value: key,
							placeholder: 'Key',
							readonly: true
						});

						$$renderer.push(`<!----> `);

						Input($$renderer, {
							class: 'flex-1',
							placeholder: 'Value',
							get value() {
								return params.fields[key];
							},

							set value($$value) {
								params.fields[key] = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'shrink-0',
							variant: 'brand',
							onclick: () => removeField(key),
							children: ($$renderer) => {
								$$renderer.push(`<!---->Remove`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div>`);
					}

					$$renderer.push(`<!--]--> <form class="flex items-center gap-3">`);

					Input($$renderer, {
						class: 'flex-1',
						placeholder: 'Key',
						get value() {
							return newField.key;
						},

						set value($$value) {
							newField.key = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Input($$renderer, {
						class: 'flex-1',
						placeholder: 'Value',
						get value() {
							return newField.value;
						},

						set value($$value) {
							newField.value = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						variant: 'brand',
						class: 'shrink-0',
						type: 'submit',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Add Field`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></form>`);
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}