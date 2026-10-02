import * as $ from 'svelte/internal/server';
import * as Kbd from "$lib/registry/ui/kbd/index.js";

export default function Kbd_group_demo($$renderer) {
	$$renderer.push(`<div class="flex flex-col items-center gap-4"><p class="text-sm text-muted-foreground">Use `);

	if (Kbd.Group) {
		$$renderer.push('<!--[-->');

		Kbd.Group($$renderer, {
			children: ($$renderer) => {
				if (Kbd.Root) {
					$$renderer.push('<!--[-->');

					Kbd.Root($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Ctrl + B`);
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
							$$renderer.push(`<!---->Ctrl + K`);
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

	$$renderer.push(` to open the command palette</p></div>`);
}