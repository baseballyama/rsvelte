import * as $ from 'svelte/internal/server';
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Avatar_group_with_icon_count($$renderer) {
	Example($$renderer, {
		title: 'Group with Icon Count',
		children: ($$renderer) => {
			if (Avatar.Group) {
				$$renderer.push('<!--[-->');

				Avatar.Group($$renderer, {
					children: ($$renderer) => {
						if (Avatar.Root) {
							$$renderer.push('<!--[-->');

							Avatar.Root($$renderer, {
								size: 'sm',
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
								size: 'sm',
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
								size: 'sm',
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

			$$renderer.push(` `);

			if (Avatar.Group) {
				$$renderer.push('<!--[-->');

				Avatar.Group($$renderer, {
					children: ($$renderer) => {
						if (Avatar.Root) {
							$$renderer.push('<!--[-->');

							Avatar.Root($$renderer, {
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

			$$renderer.push(` `);

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
}