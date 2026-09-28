import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Toggle } from "$lib/registry/ui/toggle/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<div class="flex flex-col gap-4"><div class="flex items-center gap-2"><!> <!></div> <div class="flex items-center gap-2"><!> <!></div> <div class="flex items-center gap-2"><!> <!></div></div>`);

export default function Toggle_with_button_icon($$anchor) {
	Example($$anchor, {
		title: 'With Button Icon',
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var div_1 = $.child(div);
			var node = $.child(div_1);

			Button(node, {
				variant: 'outline',
				size: 'icon-sm',
				children: ($$anchor, $$slotProps) => {
					IconPlaceholder($$anchor, {
						lucide: 'BoldIcon',
						tabler: 'IconBold',
						hugeicons: 'TextBoldIcon',
						phosphor: 'TextBIcon',
						remixicon: 'RiBold'
					});
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Toggle(node_1, {
				variant: 'outline',
				'aria-label': 'Toggle sm icon',
				size: 'sm',
				children: ($$anchor, $$slotProps) => {
					IconPlaceholder($$anchor, {
						lucide: 'BoldIcon',
						tabler: 'IconBold',
						hugeicons: 'TextBoldIcon',
						phosphor: 'TextBIcon',
						remixicon: 'RiBold'
					});
				},
				$$slots: { default: true }
			});

			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var node_2 = $.child(div_2);

			Button(node_2, {
				variant: 'outline',
				size: 'icon',
				children: ($$anchor, $$slotProps) => {
					IconPlaceholder($$anchor, {
						lucide: 'ItalicIcon',
						tabler: 'IconItalic',
						hugeicons: 'TextItalicIcon',
						phosphor: 'TextItalicIcon',
						remixicon: 'RiItalic'
					});
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Toggle(node_3, {
				variant: 'outline',
				'aria-label': 'Toggle default icon',
				size: 'default',
				children: ($$anchor, $$slotProps) => {
					IconPlaceholder($$anchor, {
						lucide: 'ItalicIcon',
						tabler: 'IconItalic',
						hugeicons: 'TextItalicIcon',
						phosphor: 'TextItalicIcon',
						remixicon: 'RiItalic'
					});
				},
				$$slots: { default: true }
			});

			$.reset(div_2);

			var div_3 = $.sibling(div_2, 2);
			var node_4 = $.child(div_3);

			Button(node_4, {
				variant: 'outline',
				size: 'icon-lg',
				children: ($$anchor, $$slotProps) => {
					IconPlaceholder($$anchor, {
						lucide: 'UnderlineIcon',
						tabler: 'IconUnderline',
						hugeicons: 'TextUnderlineIcon',
						phosphor: 'TextUnderlineIcon',
						remixicon: 'RiUnderline'
					});
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Toggle(node_5, {
				variant: 'outline',
				'aria-label': 'Toggle lg icon',
				size: 'lg',
				children: ($$anchor, $$slotProps) => {
					IconPlaceholder($$anchor, {
						lucide: 'UnderlineIcon',
						tabler: 'IconUnderline',
						hugeicons: 'TextUnderlineIcon',
						phosphor: 'TextUnderlineIcon',
						remixicon: 'RiUnderline'
					});
				},
				$$slots: { default: true }
			});

			$.reset(div_3);
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}