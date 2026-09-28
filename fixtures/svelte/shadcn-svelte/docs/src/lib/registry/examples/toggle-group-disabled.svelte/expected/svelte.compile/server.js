import * as $ from 'svelte/internal/server';
import BoldIcon from "@lucide/svelte/icons/bold";
import ItalicIcon from "@lucide/svelte/icons/italic";
import UnderlineIcon from "@lucide/svelte/icons/underline";
import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";

export default function Toggle_group_disabled($$renderer) {
	if (ToggleGroup.Root) {
		$$renderer.push('<!--[-->');

		ToggleGroup.Root($$renderer, {
			disabled: true,
			type: 'single',
			children: ($$renderer) => {
				if (ToggleGroup.Item) {
					$$renderer.push('<!--[-->');

					ToggleGroup.Item($$renderer, {
						value: 'bold',
						'aria-label': 'Toggle bold',
						children: ($$renderer) => {
							BoldIcon($$renderer, { class: 'size-4' });
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (ToggleGroup.Item) {
					$$renderer.push('<!--[-->');

					ToggleGroup.Item($$renderer, {
						value: 'italic',
						'aria-label': 'Toggle italic',
						children: ($$renderer) => {
							ItalicIcon($$renderer, { class: 'size-4' });
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (ToggleGroup.Item) {
					$$renderer.push('<!--[-->');

					ToggleGroup.Item($$renderer, {
						value: 'strikethrough',
						'aria-label': 'Toggle strikethrough',
						children: ($$renderer) => {
							UnderlineIcon($$renderer, { class: 'size-4' });
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
}