import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { ButtonGroup } from "$lib/registry/ui/button-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Label } from "$lib/registry/ui/label/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Button_group_with_fields($$renderer) {
	Example($$renderer, {
		title: 'With Fields',
		children: ($$renderer) => {
			if (Field.Group) {
				$$renderer.push('<!--[-->');

				Field.Group($$renderer, {
					class: 'grid grid-cols-3 gap-4',
					children: ($$renderer) => {
						if (Field.Field) {
							$$renderer.push('<!--[-->');

							Field.Field($$renderer, {
								class: 'col-span-2',
								children: ($$renderer) => {
									Label($$renderer, {
										for: 'width',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Width`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									ButtonGroup($$renderer, {
										children: ($$renderer) => {
											if (InputGroup.Root) {
												$$renderer.push('<!--[-->');

												InputGroup.Root($$renderer, {
													children: ($$renderer) => {
														if (InputGroup.Input) {
															$$renderer.push('<!--[-->');
															InputGroup.Input($$renderer, { id: 'width' });
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (InputGroup.Addon) {
															$$renderer.push('<!--[-->');

															InputGroup.Addon($$renderer, {
																class: 'text-muted-foreground',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->W`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (InputGroup.Addon) {
															$$renderer.push('<!--[-->');

															InputGroup.Addon($$renderer, {
																align: 'inline-end',
																class: 'text-muted-foreground',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->px`);
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

											Button($$renderer, {
												variant: 'outline',
												size: 'icon',
												children: ($$renderer) => {
													IconPlaceholder($$renderer, {
														lucide: 'MinusIcon',
														tabler: 'IconMinus',
														hugeicons: 'MinusSignIcon',
														phosphor: 'MinusIcon',
														remixicon: 'RiSubtractLine'
													});
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Button($$renderer, {
												variant: 'outline',
												size: 'icon',
												children: ($$renderer) => {
													IconPlaceholder($$renderer, {
														lucide: 'PlusIcon',
														tabler: 'IconPlus',
														hugeicons: 'PlusSignIcon',
														phosphor: 'PlusIcon',
														remixicon: 'RiAddLine'
													});
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

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}