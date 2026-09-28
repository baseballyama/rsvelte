import * as $ from 'svelte/internal/server';
import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Toggle_group_vertical_outline_with_icons($$renderer) {
	Example($$renderer, {
		title: 'Vertical Outline With Icons',
		children: ($$renderer) => {
			if (ToggleGroup.Root) {
				$$renderer.push('<!--[-->');

				ToggleGroup.Root($$renderer, {
					variant: 'outline',
					type: 'multiple',
					orientation: 'vertical',
					size: 'sm',
					children: ($$renderer) => {
						if (ToggleGroup.Item) {
							$$renderer.push('<!--[-->');

							ToggleGroup.Item($$renderer, {
								value: 'bold',
								'aria-label': 'Toggle bold',
								children: ($$renderer) => {
									IconPlaceholder($$renderer, {
										lucide: 'BoldIcon',
										tabler: 'IconBold',
										hugeicons: 'TextBoldIcon',
										phosphor: 'TextBIcon',
										remixicon: 'RiBold'
									});
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
									IconPlaceholder($$renderer, {
										lucide: 'ItalicIcon',
										tabler: 'IconItalic',
										hugeicons: 'TextItalicIcon',
										phosphor: 'TextItalicIcon',
										remixicon: 'RiItalic'
									});
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
								value: 'underline',
								'aria-label': 'Toggle underline',
								children: ($$renderer) => {
									IconPlaceholder($$renderer, {
										lucide: 'UnderlineIcon',
										tabler: 'IconUnderline',
										hugeicons: 'TextUnderlineIcon',
										phosphor: 'TextUnderlineIcon',
										remixicon: 'RiUnderline'
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
		},
		$$slots: { default: true }
	});
}