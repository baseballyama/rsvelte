import * as $ from 'svelte/internal/server';
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Avatar_with_badge_icon($$renderer) {
	Example($$renderer, {
		title: 'Badge with Icon',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex flex-wrap items-center gap-2">`);

			if (Avatar.Root) {
				$$renderer.push('<!--[-->');

				Avatar.Root($$renderer, {
					size: 'sm',
					children: ($$renderer) => {
						if (Avatar.Image) {
							$$renderer.push('<!--[-->');
							Avatar.Image($$renderer, { src: 'https://github.com/pranathip.png', alt: '@pranathip' });
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
									$$renderer.push(`<!---->PP`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Avatar.Badge) {
							$$renderer.push('<!--[-->');

							Avatar.Badge($$renderer, {
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

			if (Avatar.Root) {
				$$renderer.push('<!--[-->');

				Avatar.Root($$renderer, {
					children: ($$renderer) => {
						if (Avatar.Image) {
							$$renderer.push('<!--[-->');
							Avatar.Image($$renderer, { src: 'https://github.com/pranathip.png', alt: '@pranathip' });
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
									$$renderer.push(`<!---->PP`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Avatar.Badge) {
							$$renderer.push('<!--[-->');

							Avatar.Badge($$renderer, {
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

			if (Avatar.Root) {
				$$renderer.push('<!--[-->');

				Avatar.Root($$renderer, {
					size: 'lg',
					children: ($$renderer) => {
						if (Avatar.Image) {
							$$renderer.push('<!--[-->');
							Avatar.Image($$renderer, { src: 'https://github.com/pranathip.png', alt: '@pranathip' });
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
									$$renderer.push(`<!---->PP`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Avatar.Badge) {
							$$renderer.push('<!--[-->');

							Avatar.Badge($$renderer, {
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

			$$renderer.push(`</div> <div class="flex flex-wrap items-center gap-2">`);

			if (Avatar.Root) {
				$$renderer.push('<!--[-->');

				Avatar.Root($$renderer, {
					size: 'sm',
					children: ($$renderer) => {
						if (Avatar.Fallback) {
							$$renderer.push('<!--[-->');

							Avatar.Fallback($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->PP`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Avatar.Badge) {
							$$renderer.push('<!--[-->');

							Avatar.Badge($$renderer, {
								children: ($$renderer) => {
									IconPlaceholder($$renderer, {
										lucide: 'CheckIcon',
										tabler: 'IconCheck',
										hugeicons: 'Tick02Icon',
										phosphor: 'CheckIcon',
										remixicon: 'RiCheckLine'
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

			if (Avatar.Root) {
				$$renderer.push('<!--[-->');

				Avatar.Root($$renderer, {
					children: ($$renderer) => {
						if (Avatar.Fallback) {
							$$renderer.push('<!--[-->');

							Avatar.Fallback($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->PP`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Avatar.Badge) {
							$$renderer.push('<!--[-->');

							Avatar.Badge($$renderer, {
								children: ($$renderer) => {
									IconPlaceholder($$renderer, {
										lucide: 'CheckIcon',
										tabler: 'IconCheck',
										hugeicons: 'Tick02Icon',
										phosphor: 'CheckIcon',
										remixicon: 'RiCheckLine'
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

			if (Avatar.Root) {
				$$renderer.push('<!--[-->');

				Avatar.Root($$renderer, {
					size: 'lg',
					children: ($$renderer) => {
						if (Avatar.Fallback) {
							$$renderer.push('<!--[-->');

							Avatar.Fallback($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->PP`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Avatar.Badge) {
							$$renderer.push('<!--[-->');

							Avatar.Badge($$renderer, {
								children: ($$renderer) => {
									IconPlaceholder($$renderer, {
										lucide: 'CheckIcon',
										tabler: 'IconCheck',
										hugeicons: 'Tick02Icon',
										phosphor: 'CheckIcon',
										remixicon: 'RiCheckLine'
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
		},
		$$slots: { default: true }
	});
}