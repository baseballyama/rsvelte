import * as $ from 'svelte/internal/server';
import * as Kbd from "$lib/registry/ui/kbd/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Kbd_basic($$renderer) {
	Example($$renderer, {
		title: 'Basic',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex items-center gap-2">`);

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

			$$renderer.push(` `);

			if (Kbd.Root) {
				$$renderer.push('<!--[-->');

				Kbd.Root($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->⌘K`);
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
						$$renderer.push(`<!---->Ctrl + B`);
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