import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Toggle } from "$lib/registry/ui/toggle/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<div class="flex flex-wrap items-center gap-2"><!> <!> <!></div>`);

export default function Toggle_basic($$anchor) {
	Example($$anchor, {
		title: 'Basic',
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node = $.child(div);

			Toggle(node, {
				'aria-label': 'Toggle bold',
				pressed: true,
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
				'aria-label': 'Toggle italic',
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

			var node_2 = $.sibling(node_1, 2);

			Toggle(node_2, {
				'aria-label': 'Toggle underline',
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

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}