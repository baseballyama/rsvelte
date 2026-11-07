import * as $ from 'svelte/internal/server';
import * as Avatar from "$lib/registry/ui/avatar/index.js";

export default function Avatar_demo($$renderer) {
	$$renderer.push(`<div class="flex flex-row flex-wrap items-center gap-12">`);

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
			class: 'rounded-lg',
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

	$$renderer.push(` <div class="flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background *:data-[slot=avatar]:grayscale">`);

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
					Avatar.Image($$renderer, { src: 'https://github.com/leerob.png', alt: '@leerob' });
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

	$$renderer.push(`</div></div>`);
}