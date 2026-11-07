import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import { Spinner } from "$lib/registry/ui/spinner/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Spinner_in_input_group($$renderer) {
	Example($$renderer, {
		title: 'In Input Group',
		children: ($$renderer) => {
			if (Field.Field) {
				$$renderer.push('<!--[-->');

				Field.Field($$renderer, {
					children: ($$renderer) => {
						if (Field.Label) {
							$$renderer.push('<!--[-->');

							Field.Label($$renderer, {
								for: 'input-group-spinner',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Input Group`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (InputGroup.Root) {
							$$renderer.push('<!--[-->');

							InputGroup.Root($$renderer, {
								children: ($$renderer) => {
									if (InputGroup.Input) {
										$$renderer.push('<!--[-->');
										InputGroup.Input($$renderer, { id: 'input-group-spinner' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (InputGroup.Addon) {
										$$renderer.push('<!--[-->');

										InputGroup.Addon($$renderer, {
											children: ($$renderer) => {
												Spinner($$renderer, {});
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

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}