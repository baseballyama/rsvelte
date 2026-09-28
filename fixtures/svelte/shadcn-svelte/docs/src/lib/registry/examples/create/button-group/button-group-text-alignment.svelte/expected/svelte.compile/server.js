import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import { ButtonGroup } from "$lib/registry/ui/button-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Label } from "$lib/registry/ui/label/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Button_group_text_alignment($$renderer) {
	Example($$renderer, {
		title: 'Text Alignment',
		children: ($$renderer) => {
			if (Field.Field) {
				$$renderer.push('<!--[-->');

				Field.Field($$renderer, {
					children: ($$renderer) => {
						Label($$renderer, {
							id: 'alignment-label',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Text Alignment`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ButtonGroup($$renderer, {
							'aria-labelledby': 'alignment-label',
							children: ($$renderer) => {
								Button($$renderer, {
									variant: 'outline',
									size: 'sm',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Left`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Button($$renderer, {
									variant: 'outline',
									size: 'sm',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Center`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Button($$renderer, {
									variant: 'outline',
									size: 'sm',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Right`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Button($$renderer, {
									variant: 'outline',
									size: 'sm',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Justify`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

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