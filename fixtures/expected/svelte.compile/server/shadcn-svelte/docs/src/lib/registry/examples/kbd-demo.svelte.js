import * as $ from 'svelte/internal/server';
import * as Kbd from "$lib/registry/ui/kbd/index.js";

export default function Kbd_demo($$renderer) {
	$$renderer.push(`<div class="flex flex-col items-center gap-4">`);

	if (Kbd.Group) {
		$$renderer.push('<!--[-->');

		Kbd.Group($$renderer, {
			children: ($$renderer) => {
				if (Kbd.Root) {
					$$renderer.push('<!--[-->');

					Kbd.Root($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->⌘`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Kbd.Root) {
					$$renderer.push('<!--[-->');

					Kbd.Root($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->⇧`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Kbd.Root) {
					$$renderer.push('<!--[-->');

					Kbd.Root($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->⌥`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Kbd.Root) {
					$$renderer.push('<!--[-->');

					Kbd.Root($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->⌃`);
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

	if (Kbd.Group) {
		$$renderer.push('<!--[-->');

		Kbd.Group($$renderer, {
			children: ($$renderer) => {
				if (Kbd.Root) {
					$$renderer.push('<!--[-->');

					Kbd.Root($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Ctrl`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` <span>+</span> `);

				if (Kbd.Root) {
					$$renderer.push('<!--[-->');

					Kbd.Root($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->B`);
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