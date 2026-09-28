import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import { Label } from "$lib/registry/ui/label/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Label_with_textarea($$renderer) {
	Example($$renderer, {
		title: 'With Textarea',
		children: ($$renderer) => {
			if (Field.Field) {
				$$renderer.push('<!--[-->');

				Field.Field($$renderer, {
					children: ($$renderer) => {
						Label($$renderer, {
							for: 'label-demo-message',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Message`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);
						Textarea($$renderer, { id: 'label-demo-message', placeholder: 'Message' });
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