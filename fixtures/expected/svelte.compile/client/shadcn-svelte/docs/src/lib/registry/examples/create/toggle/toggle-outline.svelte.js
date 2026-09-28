import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Toggle } from "$lib/registry/ui/toggle/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> Italic`, 1);
var root_1 = $.from_html(`<!> Bold`, 1);
var root_2 = $.from_html(`<div class="flex flex-wrap items-center gap-2"><!> <!></div>`);

export default function Toggle_outline($$anchor) {
	Example($$anchor, {
		title: 'Outline',
		children: ($$anchor, $$slotProps) => {
			var div = root_2();
			var node = $.child(div);

			Toggle(node, {
				variant: 'outline',
				'aria-label': 'Toggle italic',
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					IconPlaceholder(node_1, {
						lucide: 'ItalicIcon',
						tabler: 'IconItalic',
						hugeicons: 'TextItalicIcon',
						phosphor: 'TextItalicIcon',
						remixicon: 'RiItalic'
					});

					$.next();
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node, 2);

			Toggle(node_2, {
				variant: 'outline',
				'aria-label': 'Toggle bold',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_3 = $.first_child(fragment_2);

					IconPlaceholder(node_3, {
						lucide: 'BoldIcon',
						tabler: 'IconBold',
						hugeicons: 'TextBoldIcon',
						phosphor: 'TextBIcon',
						remixicon: 'RiBold'
					});

					$.next();
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}