import * as $ from 'svelte/internal/server';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Toggle } from "$lib/registry/ui/toggle/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Toggle_with_button_icon_text($$renderer) {
	Example($$renderer, {
		title: 'With Button Icon + Text',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex flex-col gap-4"><div class="flex items-center gap-2">`);

			Button($$renderer, {
				size: 'sm',
				variant: 'outline',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'BoldIcon',
						tabler: 'IconBold',
						hugeicons: 'TextBoldIcon',
						phosphor: 'TextBIcon',
						remixicon: 'RiBold',
						'data-icon': 'inline-start'
					});

					$$renderer.push(`<!----> Button`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Toggle($$renderer, {
				variant: 'outline',
				'aria-label': 'Toggle sm icon text',
				size: 'sm',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'BoldIcon',
						tabler: 'IconBold',
						hugeicons: 'TextBoldIcon',
						phosphor: 'TextBIcon',
						remixicon: 'RiBold'
					});

					$$renderer.push(`<!----> Toggle`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="flex items-center gap-2">`);

			Button($$renderer, {
				size: 'default',
				variant: 'outline',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'ItalicIcon',
						tabler: 'IconItalic',
						hugeicons: 'TextItalicIcon',
						phosphor: 'TextItalicIcon',
						remixicon: 'RiItalic',
						'data-icon': 'inline-start'
					});

					$$renderer.push(`<!----> Button`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Toggle($$renderer, {
				variant: 'outline',
				'aria-label': 'Toggle default icon text',
				size: 'default',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'ItalicIcon',
						tabler: 'IconItalic',
						hugeicons: 'TextItalicIcon',
						phosphor: 'TextItalicIcon',
						remixicon: 'RiItalic'
					});

					$$renderer.push(`<!----> Toggle`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="flex items-center gap-2">`);

			Button($$renderer, {
				size: 'lg',
				variant: 'outline',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'UnderlineIcon',
						tabler: 'IconUnderline',
						hugeicons: 'TextUnderlineIcon',
						phosphor: 'TextUnderlineIcon',
						remixicon: 'RiUnderline',
						'data-icon': 'inline-start'
					});

					$$renderer.push(`<!----> Button`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Toggle($$renderer, {
				variant: 'outline',
				'aria-label': 'Toggle lg icon text',
				size: 'lg',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'UnderlineIcon',
						tabler: 'IconUnderline',
						hugeicons: 'TextUnderlineIcon',
						phosphor: 'TextUnderlineIcon',
						remixicon: 'RiUnderline'
					});

					$$renderer.push(`<!----> Toggle`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		},
		$$slots: { default: true }
	});
}