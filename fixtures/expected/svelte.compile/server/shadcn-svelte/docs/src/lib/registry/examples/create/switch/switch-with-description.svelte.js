import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import { Switch } from "$lib/registry/ui/switch/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Switch_with_description($$renderer) {
	Example($$renderer, {
		title: 'With Description',
		children: ($$renderer) => {
			if (Field.Label) {
				$$renderer.push('<!--[-->');

				Field.Label($$renderer, {
					for: 'switch-focus-mode',
					children: ($$renderer) => {
						if (Field.Field) {
							$$renderer.push('<!--[-->');

							Field.Field($$renderer, {
								orientation: 'horizontal',
								children: ($$renderer) => {
									if (Field.Content) {
										$$renderer.push('<!--[-->');

										Field.Content($$renderer, {
											children: ($$renderer) => {
												if (Field.Title) {
													$$renderer.push('<!--[-->');

													Field.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Share across devices`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Field.Description) {
													$$renderer.push('<!--[-->');

													Field.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Focus is shared across devices, and turns off when you leave the app.`);
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

									$$renderer.push(` `);
									Switch($$renderer, { id: 'switch-focus-mode' });
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

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}