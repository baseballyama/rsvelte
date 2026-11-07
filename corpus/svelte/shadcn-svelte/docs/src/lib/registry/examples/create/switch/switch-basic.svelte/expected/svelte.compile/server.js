import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import { Switch } from "$lib/registry/ui/switch/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Switch_basic($$renderer) {
	Example($$renderer, {
		title: 'Basic',
		children: ($$renderer) => {
			if (Field.Field) {
				$$renderer.push('<!--[-->');

				Field.Field($$renderer, {
					orientation: 'horizontal',
					children: ($$renderer) => {
						Switch($$renderer, { id: 'switch-basic' });
						$$renderer.push(`<!----> `);

						if (Field.Label) {
							$$renderer.push('<!--[-->');

							Field.Label($$renderer, {
								for: 'switch-basic',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Airplane Mode`);
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