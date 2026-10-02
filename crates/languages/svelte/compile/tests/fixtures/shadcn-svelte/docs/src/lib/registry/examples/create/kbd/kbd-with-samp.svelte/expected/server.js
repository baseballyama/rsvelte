import * as $ from 'svelte/internal/server';
import * as Kbd from "$lib/registry/ui/kbd/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Kbd_with_samp($$renderer) {
	Example($$renderer, {
		title: 'With samp',
		children: ($$renderer) => {
			if (Kbd.Root) {
				$$renderer.push('<!--[-->');

				Kbd.Root($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<samp>File</samp>`);
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