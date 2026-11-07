import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Popover_with_form($$renderer) {
	Example($$renderer, {
		title: 'With Form',
		children: ($$renderer) => {
			if (Popover.Root) {
				$$renderer.push('<!--[-->');

				Popover.Root($$renderer, {
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									{ variant: 'outline' },
									props,
									{
										children: ($$renderer) => {
											$$renderer.push(`<!---->Open Popover`);
										},
										$$slots: { default: true }
									}
								]));
							}

							if (Popover.Trigger) {
								$$renderer.push('<!--[-->');
								Popover.Trigger($$renderer, { child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (Popover.Content) {
							$$renderer.push('<!--[-->');

							Popover.Content($$renderer, {
								class: 'w-64',
								align: 'start',
								children: ($$renderer) => {
									if (Popover.Header) {
										$$renderer.push('<!--[-->');

										Popover.Header($$renderer, {
											children: ($$renderer) => {
												if (Popover.Title) {
													$$renderer.push('<!--[-->');

													Popover.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Dimensions`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Popover.Description) {
													$$renderer.push('<!--[-->');

													Popover.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Set the dimensions for the layer.`);
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

									if (Field.Group) {
										$$renderer.push('<!--[-->');

										Field.Group($$renderer, {
											class: 'gap-4',
											children: ($$renderer) => {
												if (Field.Field) {
													$$renderer.push('<!--[-->');

													Field.Field($$renderer, {
														orientation: 'horizontal',
														children: ($$renderer) => {
															if (Field.Label) {
																$$renderer.push('<!--[-->');

																Field.Label($$renderer, {
																	for: 'width',
																	class: 'w-1/2',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Width`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);
															Input($$renderer, { id: 'width', value: '100%' });
															$$renderer.push(`<!---->`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Field.Field) {
													$$renderer.push('<!--[-->');

													Field.Field($$renderer, {
														orientation: 'horizontal',
														children: ($$renderer) => {
															if (Field.Label) {
																$$renderer.push('<!--[-->');

																Field.Label($$renderer, {
																	for: 'height',
																	class: 'w-1/2',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Height`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);
															Input($$renderer, { id: 'height', value: '25px' });
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