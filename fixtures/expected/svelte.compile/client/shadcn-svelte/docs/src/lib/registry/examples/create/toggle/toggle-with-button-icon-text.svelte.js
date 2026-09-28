import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Toggle } from "$lib/registry/ui/toggle/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> Button`, 1);
var root_1 = $.from_html(`<!> Toggle`, 1);
var root_2 = $.from_html(`<div class="flex flex-col gap-4"><div class="flex items-center gap-2"><!> <!></div> <div class="flex items-center gap-2"><!> <!></div> <div class="flex items-center gap-2"><!> <!></div></div>`);

export default function Toggle_with_button_icon_text($$anchor) {
	Example($$anchor, {
		title: 'With Button Icon + Text',
		children: ($$anchor, $$slotProps) => {
			var div = root_2();
			var div_1 = $.child(div);
			var node = $.child(div_1);

			Button(node, {
				size: 'sm',
				variant: 'outline',
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					IconPlaceholder(node_1, {
						lucide: 'BoldIcon',
						tabler: 'IconBold',
						hugeicons: 'TextBoldIcon',
						phosphor: 'TextBIcon',
						remixicon: 'RiBold',
						'data-icon': 'inline-start'
					});

					$.next();
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node, 2);

			Toggle(node_2, {
				variant: 'outline',
				'aria-label': 'Toggle sm icon text',
				size: 'sm',
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

			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var node_4 = $.child(div_2);

			Button(node_4, {
				size: 'default',
				variant: 'outline',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_5 = $.first_child(fragment_3);

					IconPlaceholder(node_5, {
						lucide: 'ItalicIcon',
						tabler: 'IconItalic',
						hugeicons: 'TextItalicIcon',
						phosphor: 'TextItalicIcon',
						remixicon: 'RiItalic',
						'data-icon': 'inline-start'
					});

					$.next();
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_4, 2);

			Toggle(node_6, {
				variant: 'outline',
				'aria-label': 'Toggle default icon text',
				size: 'default',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_7 = $.first_child(fragment_4);

					IconPlaceholder(node_7, {
						lucide: 'ItalicIcon',
						tabler: 'IconItalic',
						hugeicons: 'TextItalicIcon',
						phosphor: 'TextItalicIcon',
						remixicon: 'RiItalic'
					});

					$.next();
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.reset(div_2);

			var div_3 = $.sibling(div_2, 2);
			var node_8 = $.child(div_3);

			Button(node_8, {
				size: 'lg',
				variant: 'outline',
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root();
					var node_9 = $.first_child(fragment_5);

					IconPlaceholder(node_9, {
						lucide: 'UnderlineIcon',
						tabler: 'IconUnderline',
						hugeicons: 'TextUnderlineIcon',
						phosphor: 'TextUnderlineIcon',
						remixicon: 'RiUnderline',
						'data-icon': 'inline-start'
					});

					$.next();
					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_8, 2);

			Toggle(node_10, {
				variant: 'outline',
				'aria-label': 'Toggle lg icon text',
				size: 'lg',
				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root_1();
					var node_11 = $.first_child(fragment_6);

					IconPlaceholder(node_11, {
						lucide: 'UnderlineIcon',
						tabler: 'IconUnderline',
						hugeicons: 'TextUnderlineIcon',
						phosphor: 'TextUnderlineIcon',
						remixicon: 'RiUnderline'
					});

					$.next();
					$.append($$anchor, fragment_6);
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