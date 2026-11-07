import * as $ from 'svelte/internal/server';
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";

export default function Share($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const permissions = [
			{ label: "Can edit", value: "edit" },
			{ label: "Can view", value: "view" }
		];

		let people = [
			{
				name: "Olivia Martin",
				email: "m@example.com",
				avatar: "/avatars/03.png",
				permission: "edit"
			},

			{
				name: "Isabella Nguyen",
				email: "b@example.com",
				avatar: "/avatars/04.png",
				permission: "edit"
			},

			{
				name: "Sofia Davis",
				email: "p@example.com",
				avatar: "/avatars/05.png",
				permission: "edit"
			},

			{
				name: "Ethan Thompson",
				email: "e@example.com",
				avatar: "/avatars/01.png",
				permission: "edit"
			}
		];

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Card.Root) {
				$$renderer.push('<!--[-->');

				Card.Root($$renderer, {
					children: ($$renderer) => {
						if (Card.Header) {
							$$renderer.push('<!--[-->');

							Card.Header($$renderer, {
								children: ($$renderer) => {
									if (Card.Title) {
										$$renderer.push('<!--[-->');

										Card.Title($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Share this document`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Card.Description) {
										$$renderer.push('<!--[-->');

										Card.Description($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Anyone with the link can view this document.`);
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

						if (Card.Content) {
							$$renderer.push('<!--[-->');

							Card.Content($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<div class="flex items-center gap-2">`);

									Label($$renderer, {
										for: 'link',
										class: 'sr-only',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Link`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										id: 'link',
										value: 'http://example.com/link/to/document',
										readonly: true,
										class: 'h-8'
									});

									$$renderer.push(`<!----> `);

									Button($$renderer, {
										size: 'sm',
										variant: 'outline',
										class: 'shadow-none',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Copy Link`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----></div> `);
									Separator($$renderer, { class: 'my-4' });
									$$renderer.push(`<!----> <div class="flex flex-col gap-4"><div class="text-sm font-medium">People with access</div> `);

									if (Item.Group) {
										$$renderer.push('<!--[-->');

										Item.Group($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!--[-->`);

												const each_array = $.ensure_array_like(people);

												for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
													let person = each_array[$$index_1];

													if (Item.Item) {
														$$renderer.push('<!--[-->');

														Item.Item($$renderer, {
															class: 'px-0 py-2',
															children: ($$renderer) => {
																if (Item.Media) {
																	$$renderer.push('<!--[-->');

																	Item.Media($$renderer, {
																		children: ($$renderer) => {
																			if (Avatar.Root) {
																				$$renderer.push('<!--[-->');

																				Avatar.Root($$renderer, {
																					children: ($$renderer) => {
																						if (Avatar.Image) {
																							$$renderer.push('<!--[-->');
																							Avatar.Image($$renderer, { src: person.avatar, alt: 'Image' });
																							$$renderer.push('<!--]-->');
																						} else {
																							$$renderer.push('<!--[!-->');
																							$$renderer.push('<!--]-->');
																						}

																						$$renderer.push(` `);

																						if (Avatar.Fallback) {
																							$$renderer.push('<!--[-->');

																							Avatar.Fallback($$renderer, {
																								children: ($$renderer) => {
																									$$renderer.push(`<!---->${$.escape(person.name.charAt(0))}`);
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

																$$renderer.push(` `);

																if (Item.Content) {
																	$$renderer.push('<!--[-->');

																	Item.Content($$renderer, {
																		children: ($$renderer) => {
																			if (Item.Title) {
																				$$renderer.push('<!--[-->');

																				Item.Title($$renderer, {
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->${$.escape(person.name)}`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` `);

																			if (Item.Description) {
																				$$renderer.push('<!--[-->');

																				Item.Description($$renderer, {
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->${$.escape(person.email)}`);
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

																if (Item.Actions) {
																	$$renderer.push('<!--[-->');

																	Item.Actions($$renderer, {
																		children: ($$renderer) => {
																			if (Select.Root) {
																				$$renderer.push('<!--[-->');

																				Select.Root($$renderer, {
																					type: 'single',
																					get value() {
																						return person.permission;
																					},

																					set value($$value) {
																						person.permission = $$value;
																						$$settled = false;
																					},

																					children: ($$renderer) => {
																						if (Select.Trigger) {
																							$$renderer.push('<!--[-->');

																							Select.Trigger($$renderer, {
																								class: 'ms-auto pe-2',
																								size: 'sm',
																								'aria-label': 'Edit',
																								children: ($$renderer) => {
																									$$renderer.push(`<!---->${$.escape(permissions.find((p) => p.value === person.permission)?.label ?? "Select")}`);
																								},
																								$$slots: { default: true }
																							});

																							$$renderer.push('<!--]-->');
																						} else {
																							$$renderer.push('<!--[!-->');
																							$$renderer.push('<!--]-->');
																						}

																						$$renderer.push(` `);

																						if (Select.Content) {
																							$$renderer.push('<!--[-->');

																							Select.Content($$renderer, {
																								align: 'end',
																								children: ($$renderer) => {
																									$$renderer.push(`<!--[-->`);

																									const each_array_1 = $.ensure_array_like(permissions);

																									for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
																										let permission = each_array_1[$$index];

																										if (Select.Item) {
																											$$renderer.push('<!--[-->');

																											Select.Item($$renderer, {
																												value: permission.value,
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->${$.escape(permission.label)}`);
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}
																									}

																									$$renderer.push(`<!--]-->`);
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
												}

												$$renderer.push(`<!--]-->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(`</div>`);
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}