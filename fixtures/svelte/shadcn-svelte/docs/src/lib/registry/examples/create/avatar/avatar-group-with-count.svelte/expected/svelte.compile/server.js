import * as $ from 'svelte/internal/server';
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Avatar_group_with_count($$renderer) {
	Example($$renderer, {
		title: 'Group with Count',
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
									$$renderer.push(`<!---->+3`);
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
									$$renderer.push(`<!---->+3`);
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
								size: 'lg',
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
								size: 'lg',
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
									$$renderer.push(`<!---->+3`);
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