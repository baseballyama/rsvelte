import * as $ from 'svelte/internal/server';
import * as Checkbox from "$lib/registry/ui/checkbox/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Checkbox_disabled($$renderer) {
	Example($$renderer, {
		title: 'Disabled',
		children: ($$renderer) => {
			if (Field.Field) {
				$$renderer.push('<!--[-->');

				Field.Field($$renderer, {
					orientation: 'horizontal',
					children: ($$renderer) => {
						if (Checkbox.Root) {
							$$renderer.push('<!--[-->');
							Checkbox.Root($$renderer, { id: 'toggle', disabled: true });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Field.Label) {
							$$renderer.push('<!--[-->');

							Field.Label($$renderer, {
								for: 'toggle',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Enable notifications`);
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
}