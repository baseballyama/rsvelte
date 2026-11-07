import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";

export default function Account_access($$renderer) {
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
										$$renderer.push(`<!---->Account Access`);
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
										$$renderer.push(`<!---->Update your credentials or re-authenticate.`);
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
							if (Field.Group) {
								$$renderer.push('<!--[-->');

								Field.Group($$renderer, {
									children: ($$renderer) => {
										if (Field.Field) {
											$$renderer.push('<!--[-->');

											Field.Field($$renderer, {
												children: ($$renderer) => {
													if (Field.Label) {
														$$renderer.push('<!--[-->');

														Field.Label($$renderer, {
															for: 'email-address',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Email Address`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													Input($$renderer, {
														id: 'email-address',
														type: 'email',
														value: 'artist@studio.inc'
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

										$$renderer.push(` `);

										if (Field.Field) {
											$$renderer.push('<!--[-->');

											Field.Field($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<div class="flex items-center justify-between">`);

													if (Field.Label) {
														$$renderer.push('<!--[-->');

														Field.Label($$renderer, {
															for: 'current-password',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Current Password`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` <a href="#/" class="text-xs font-medium tracking-wider text-muted-foreground uppercase hover:text-foreground">Forgot?</a></div> `);

													Input($$renderer, {
														id: 'current-password',
														type: 'password',
														value: 'password123'
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

				$$renderer.push(` `);

				if (Card.Footer) {
					$$renderer.push('<!--[-->');

					Card.Footer($$renderer, {
						class: 'flex-col gap-4',
						children: ($$renderer) => {
							Button($$renderer, {
								class: 'w-full',
								children: ($$renderer) => {
									IconPlaceholder($$renderer, {
										lucide: 'LockKeyholeIcon',
										tabler: 'IconLock',
										hugeicons: 'SquareLock02Icon',
										phosphor: 'LockKeyIcon',
										remixicon: 'RiLockLine'
									});

									$$renderer.push(`<!----> Update Security`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							{
								function child($$renderer, { props }) {
									$$renderer.push(`<a${$.attributes({ href: '#/', ...props })}>`);

									if (Item.Media) {
										$$renderer.push('<!--[-->');

										Item.Media($$renderer, {
											variant: 'icon',
											children: ($$renderer) => {
												IconPlaceholder($$renderer, {
													lucide: 'AlertCircleIcon',
													tabler: 'IconAlertCircle',
													hugeicons: 'AlertCircleIcon',
													phosphor: 'WarningCircleIcon',
													remixicon: 'RiErrorWarningLine',
													class: 'text-destructive'
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
														children: ($$renderer) => {
															$$renderer.push(`<!---->Danger Zone`);
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
														class: 'line-clamp-1',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Archive account and remove catalog`);
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

									IconPlaceholder($$renderer, {
										lucide: 'ArrowRightIcon',
										tabler: 'IconArrowRight',
										hugeicons: 'ArrowRight01Icon',
										phosphor: 'ArrowRightIcon',
										remixicon: 'RiArrowRightLine',
										class: 'size-4'
									});

									$$renderer.push(`<!----></a>`);
								}

								if (Item.Root) {
									$$renderer.push('<!--[-->');
									Item.Root($$renderer, { variant: 'muted', child, $$slots: { child: true } });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
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