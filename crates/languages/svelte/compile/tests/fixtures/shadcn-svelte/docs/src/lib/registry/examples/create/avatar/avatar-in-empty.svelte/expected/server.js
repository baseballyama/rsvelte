import * as $ from 'svelte/internal/server';
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as Empty from "$lib/registry/ui/empty/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Avatar_in_empty($$renderer) {
	Example($$renderer, {
		title: 'In Empty',
		children: ($$renderer) => {
			if (Empty.Root) {
				$$renderer.push('<!--[-->');

				Empty.Root($$renderer, {
					class: 'w-full flex-none border',
					children: ($$renderer) => {
						if (Empty.Header) {
							$$renderer.push('<!--[-->');

							Empty.Header($$renderer, {
								children: ($$renderer) => {
									if (Empty.Media) {
										$$renderer.push('<!--[-->');

										Empty.Media($$renderer, {
											children: ($$renderer) => {
												if (Avatar.Group) {
													$$renderer.push('<!--[-->');

													Avatar.Group($$renderer, {
														children: ($$renderer) => {
															if (Avatar.Root) {
																$$renderer.push('<!--[-->');

																Avatar.Root($$renderer, {
																	size: 'lg',
																	children: ($$renderer) => {
																		if (Avatar.Image) {
																			$$renderer.push('<!--[-->');

																			Avatar.Image($$renderer, {
																				src: 'https://github.com/shadcn.png',
																				alt: '@shadcn',
																				class: 'grayscale'
																			});

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
																					$$renderer.push(`<!---->CN`);
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

															if (Avatar.Root) {
																$$renderer.push('<!--[-->');

																Avatar.Root($$renderer, {
																	size: 'lg',
																	children: ($$renderer) => {
																		if (Avatar.Image) {
																			$$renderer.push('<!--[-->');

																			Avatar.Image($$renderer, {
																				src: 'https://github.com/maxleiter.png',
																				alt: '@maxleiter',
																				class: 'grayscale'
																			});

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
																					$$renderer.push(`<!---->LR`);
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

															if (Avatar.Root) {
																$$renderer.push('<!--[-->');

																Avatar.Root($$renderer, {
																	size: 'lg',
																	children: ($$renderer) => {
																		if (Avatar.Image) {
																			$$renderer.push('<!--[-->');

																			Avatar.Image($$renderer, {
																				src: 'https://github.com/evilrabbit.png',
																				alt: '@evilrabbit',
																				class: 'grayscale'
																			});

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
																					$$renderer.push(`<!---->ER`);
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

															if (Avatar.GroupCount) {
																$$renderer.push('<!--[-->');

																Avatar.GroupCount($$renderer, {
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

									if (Empty.Title) {
										$$renderer.push('<!--[-->');

										Empty.Title($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->No Team Members`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Empty.Description) {
										$$renderer.push('<!--[-->');

										Empty.Description($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Invite your team to collaborate on this project.`);
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

						if (Empty.Content) {
							$$renderer.push('<!--[-->');

							Empty.Content($$renderer, {
								children: ($$renderer) => {
									Button($$renderer, {
										children: ($$renderer) => {
											IconPlaceholder($$renderer, {
												lucide: 'PlusIcon',
												tabler: 'IconPlus',
												hugeicons: 'PlusSignIcon',
												phosphor: 'PlusIcon',
												remixicon: 'RiAddLine'
											});

											$$renderer.push(`<!----> Invite Members`);
										},
										$$slots: { default: true }
									});
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