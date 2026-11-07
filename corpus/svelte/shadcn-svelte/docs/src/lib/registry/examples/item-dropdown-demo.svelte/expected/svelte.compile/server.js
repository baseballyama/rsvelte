import * as $ from 'svelte/internal/server';
import ChevronDown from "@lucide/svelte/icons/chevron-down";
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Item_dropdown_demo($$renderer) {
	const people = [
		{
			username: "shadcn",
			avatar: "https://github.com/shadcn.png",
			email: "shadcn@vercel.com"
		},

		{
			username: "maxleiter",
			avatar: "https://github.com/maxleiter.png",
			email: "maxleiter@vercel.com"
		},

		{
			username: "evilrabbit",
			avatar: "https://github.com/evilrabbit.png",
			email: "evilrabbit@vercel.com"
		}
	];

	$$renderer.push(`<div class="flex min-h-64 w-full max-w-md flex-col items-center gap-6">`);

	if (DropdownMenu.Root) {
		$$renderer.push('<!--[-->');

		DropdownMenu.Root($$renderer, {
			children: ($$renderer) => {
				{
					function child($$renderer, { props }) {
						Button($$renderer, $.spread_props([
							props,
							{
								variant: 'outline',
								size: 'sm',
								class: 'w-fit',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Select `);
									ChevronDown($$renderer, {});
									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							}
						]));
					}

					if (DropdownMenu.Trigger) {
						$$renderer.push('<!--[-->');
						DropdownMenu.Trigger($$renderer, { child, $$slots: { child: true } });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}

				$$renderer.push(` `);

				if (DropdownMenu.Content) {
					$$renderer.push('<!--[-->');

					DropdownMenu.Content($$renderer, {
						class: 'w-72 [--radius:0.65rem]',
						align: 'end',
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like(people);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let person = each_array[$$index];

								if (DropdownMenu.Item) {
									$$renderer.push('<!--[-->');

									DropdownMenu.Item($$renderer, {
										class: 'p-0',
										children: ($$renderer) => {
											if (Item.Root) {
												$$renderer.push('<!--[-->');

												Item.Root($$renderer, {
													size: 'sm',
													class: 'w-full p-2',
													children: ($$renderer) => {
														if (Item.Media) {
															$$renderer.push('<!--[-->');

															Item.Media($$renderer, {
																children: ($$renderer) => {
																	if (Avatar.Root) {
																		$$renderer.push('<!--[-->');

																		Avatar.Root($$renderer, {
																			class: 'size-8',
																			children: ($$renderer) => {
																				if (Avatar.Image) {
																					$$renderer.push('<!--[-->');
																					Avatar.Image($$renderer, { src: person.avatar, class: 'grayscale' });
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
																							$$renderer.push(`<!---->${$.escape(person.username.charAt(0))}`);
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
																class: 'gap-0.5',
																children: ($$renderer) => {
																	if (Item.Title) {
																		$$renderer.push('<!--[-->');

																		Item.Title($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(person.username)}`);
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
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(`</div>`);
}