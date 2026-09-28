import * as $ from 'svelte/internal/server';
import * as Alert from "$lib/registry/ui/alert/index.js";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Activate_agent_dialog($$renderer) {
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
										$$renderer.push(`<strong>Ship faster &amp; safer</strong> with <strong>Vercel Agent</strong>`);
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
										$$renderer.push(`<!---->Your use is subject to Vercel's <a href="https://vercel.com/legal" class="underline">Public Beta Agreement</a> and <a href="https://vercel.com/legal/ai-terms" class="underline">AI Product Terms</a>.`);
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
						class: 'flex flex-col gap-4',
						children: ($$renderer) => {
							if (Item.Group) {
								$$renderer.push('<!--[-->');

								Item.Group($$renderer, {
									class: 'gap-0',
									children: ($$renderer) => {
										if (Item.Root) {
											$$renderer.push('<!--[-->');

											Item.Root($$renderer, {
												size: 'xs',
												class: 'px-0',
												children: ($$renderer) => {
													if (Item.Media) {
														$$renderer.push('<!--[-->');

														Item.Media($$renderer, {
															variant: 'icon',
															class: 'self-start',
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'CheckCircle2Icon',
																	tabler: 'IconCircleCheckFilled',
																	hugeicons: 'CheckmarkCircle02Icon',
																	phosphor: 'CheckCircleIcon',
																	remixicon: 'RiCheckboxCircleLine',
																	class: 'size-5 fill-primary text-primary-foreground'
																});
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
																		class: 'inline leading-relaxed font-normal text-muted-foreground *:[strong]:font-medium *:[strong]:text-foreground',
																		children: ($$renderer) => {
																			$$renderer.push(`<strong>Code reviews</strong> with full codebase context to catch <strong>hard-to-find</strong> bugs.`);
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

										if (Item.Root) {
											$$renderer.push('<!--[-->');

											Item.Root($$renderer, {
												size: 'xs',
												class: 'px-0',
												children: ($$renderer) => {
													if (Item.Media) {
														$$renderer.push('<!--[-->');

														Item.Media($$renderer, {
															variant: 'icon',
															class: 'self-start',
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'CheckCircle2Icon',
																	tabler: 'IconCircleCheckFilled',
																	hugeicons: 'CheckmarkCircle02Icon',
																	phosphor: 'CheckCircleIcon',
																	remixicon: 'RiCheckboxCircleLine',
																	class: 'size-5 fill-primary text-primary-foreground'
																});
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
																		class: 'inline leading-relaxed font-normal text-muted-foreground *:[strong]:font-medium *:[strong]:text-foreground',
																		children: ($$renderer) => {
																			$$renderer.push(`<strong>Code suggestions</strong> validated in sandboxes before you merge.`);
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

										if (Item.Root) {
											$$renderer.push('<!--[-->');

											Item.Root($$renderer, {
												size: 'xs',
												class: 'px-0',
												children: ($$renderer) => {
													if (Item.Media) {
														$$renderer.push('<!--[-->');

														Item.Media($$renderer, {
															variant: 'icon',
															class: 'self-start',
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'CheckCircle2Icon',
																	tabler: 'IconCircleCheckFilled',
																	hugeicons: 'CheckmarkCircle02Icon',
																	phosphor: 'CheckCircleIcon',
																	remixicon: 'RiCheckboxCircleLine',
																	class: 'size-5 fill-primary text-primary-foreground'
																});
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
																		class: 'inline leading-relaxed font-normal text-muted-foreground *:[strong]:font-medium *:[strong]:text-foreground',
																		children: ($$renderer) => {
																			$$renderer.push(`<strong>Root-cause analysis</strong> for production issues with deployment context. `);

																			Badge($$renderer, {
																				variant: 'secondary',
																				class: 'ml-1 bg-chart-1 text-chart-5',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Requires Observability Plus`);
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

							if (Alert.Root) {
								$$renderer.push('<!--[-->');

								Alert.Root($$renderer, {
									children: ($$renderer) => {
										if (Alert.Description) {
											$$renderer.push('<!--[-->');

											Alert.Description($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Pro teams get $100 in Vercel Agent trial credit for 2 weeks after activation.`);
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

				if (Card.Footer) {
					$$renderer.push('<!--[-->');

					Card.Footer($$renderer, {
						class: 'justify-end gap-2',
						children: ($$renderer) => {
							Button($$renderer, {
								variant: 'outline',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Enable with $100 credits`);
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
}