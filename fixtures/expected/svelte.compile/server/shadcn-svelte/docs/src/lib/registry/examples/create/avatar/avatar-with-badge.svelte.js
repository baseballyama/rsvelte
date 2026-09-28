import * as $ from 'svelte/internal/server';
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Avatar_with_badge($$renderer) {
	Example($$renderer, {
		title: 'Badge',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex flex-wrap items-center gap-2">`);

			if (Avatar.Root) {
				$$renderer.push('<!--[-->');

				Avatar.Root($$renderer, {
					size: 'sm',
					children: ($$renderer) => {
						if (Avatar.Image) {
							$$renderer.push('<!--[-->');
							Avatar.Image($$renderer, { src: 'https://github.com/jorgezreik.png', alt: '@jorgezreik' });
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
									$$renderer.push(`<!---->JZ`);
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
							Avatar.Badge($$renderer, {});
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
							Avatar.Image($$renderer, { src: 'https://github.com/jorgezreik.png', alt: '@jorgezreik' });
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
									$$renderer.push(`<!---->JZ`);
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
							Avatar.Badge($$renderer, {});
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
							Avatar.Image($$renderer, { src: 'https://github.com/jorgezreik.png', alt: '@jorgezreik' });
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
									$$renderer.push(`<!---->JZ`);
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
							Avatar.Badge($$renderer, {});
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
									$$renderer.push(`<!---->JZ`);
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
							Avatar.Badge($$renderer, {});
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
									$$renderer.push(`<!---->JZ`);
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
							Avatar.Badge($$renderer, {});
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
									$$renderer.push(`<!---->JZ`);
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
							Avatar.Badge($$renderer, {});
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