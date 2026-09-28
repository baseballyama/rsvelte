import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Label_with_input($$renderer) {
	Example($$renderer, {
		title: 'With Input',
		children: ($$renderer) => {
			if (Field.Field) {
				$$renderer.push('<!--[-->');

				Field.Field($$renderer, {
					children: ($$renderer) => {
						Label($$renderer, {
							for: 'label-demo-username',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Username`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);
						Input($$renderer, { id: 'label-demo-username', placeholder: 'Username' });
						$$renderer.push(`<!---->`);
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