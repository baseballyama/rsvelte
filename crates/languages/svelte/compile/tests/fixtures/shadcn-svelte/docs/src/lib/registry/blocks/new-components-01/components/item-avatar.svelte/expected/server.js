import * as $ from 'svelte/internal/server';
import Plus from "@lucide/svelte/icons/plus";
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Item_avatar($$renderer) {
	$$renderer.push(`<div class="flex w-full max-w-lg flex-col gap-6">`);

	if (Item.Root) {
		$$renderer.push('<!--[-->');

		Item.Root($$renderer, {
			variant: 'outline',
			children: ($$renderer) => {
				if (Item.Media) {
					$$renderer.push('<!--[-->');

					Item.Media($$renderer, {
						children: ($$renderer) => {
							if (Avatar.Root) {
								$$renderer.push('<!--[-->');

								Avatar.Root($$renderer, {
									class: 'size-10',
									children: ($$renderer) => {
										if (Avatar.Image) {
											$$renderer.push('<!--[-->');
											Avatar.Image($$renderer, { src: 'https://github.com/evilrabbit.png' });
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
										$$renderer.push(`<!---->Evil Rabbit`);
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
										$$renderer.push(`<!---->Last seen 5 months ago`);
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
							Button($$renderer, {
								size: 'icon',
								variant: 'outline',
								class: 'rounded-full',
								'aria-label': 'Invite',
								children: ($$renderer) => {
									Plus($$renderer, {});
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

	$$renderer.push(` `);

	if (Item.Root) {
		$$renderer.push('<!--[-->');

		Item.Root($$renderer, {
			variant: 'outline',
			children: ($$renderer) => {
				if (Item.Media) {
					$$renderer.push('<!--[-->');

					Item.Media($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<div class="flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background *:data-[slot=avatar]:grayscale">`);

							if (Avatar.Root) {
								$$renderer.push('<!--[-->');

								Avatar.Root($$renderer, {
									class: 'hidden sm:flex',
									children: ($$renderer) => {
										if (Avatar.Image) {
											$$renderer.push('<!--[-->');
											Avatar.Image($$renderer, { src: 'https://github.com/shadcn.png', alt: '@shadcn' });
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
									class: 'hidden sm:flex',
									children: ($$renderer) => {
										if (Avatar.Image) {
											$$renderer.push('<!--[-->');
											Avatar.Image($$renderer, { src: 'https://github.com/maxleiter.png', alt: '@maxleiter' });
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
									children: ($$renderer) => {
										if (Avatar.Image) {
											$$renderer.push('<!--[-->');
											Avatar.Image($$renderer, { src: 'https://github.com/evilrabbit.png', alt: '@evilrabbit' });
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

							$$renderer.push(`</div>`);
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

							if (Item.Description) {
								$$renderer.push('<!--[-->');

								Item.Description($$renderer, {
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

				if (Item.Actions) {
					$$renderer.push('<!--[-->');

					Item.Actions($$renderer, {
						children: ($$renderer) => {
							Button($$renderer, {
								size: 'sm',
								variant: 'outline',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Invite`);
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

	$$renderer.push(`</div>`);
}