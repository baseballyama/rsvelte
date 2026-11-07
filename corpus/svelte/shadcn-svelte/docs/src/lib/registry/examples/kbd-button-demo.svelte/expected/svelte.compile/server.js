import * as $ from 'svelte/internal/server';
import * as Kbd from "$lib/registry/ui/kbd/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Kbd_button_demo($$renderer) {
	$$renderer.push(`<div class="flex flex-wrap items-center gap-4">`);

	Button($$renderer, {
		variant: 'outline',
		size: 'sm',
		class: 'pe-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Accept `);

			if (Kbd.Root) {
				$$renderer.push('<!--[-->');

				Kbd.Root($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->⏎`);
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

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		variant: 'outline',
		size: 'sm',
		class: 'pe-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Cancel `);

			if (Kbd.Root) {
				$$renderer.push('<!--[-->');

				Kbd.Root($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Esc`);
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

	$$renderer.push(`<!----></div>`);
}