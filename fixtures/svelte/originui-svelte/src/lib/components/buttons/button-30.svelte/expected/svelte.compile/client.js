import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ToggleGroup, ToggleGroupItem } from '$lib/components/ui/toggle-group/index.js';
import AlignCenter from '@lucide/svelte/icons/align-center';
import AlignJustify from '@lucide/svelte/icons/align-justify';
import AlignLeft from '@lucide/svelte/icons/align-left';
import AlignRight from '@lucide/svelte/icons/align-right';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Button_30($$anchor) {
	let value = $.state('center');

	ToggleGroup($$anchor, {
		class: 'divide-background inline-flex divide-x',
		type: 'single',
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			ToggleGroupItem(node, {
				class: 'bg-primary/80 text-primary-foreground hover:bg-primary hover:text-primary-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
				'aria-label': 'Align Left',
				value: 'left',
				children: ($$anchor, $$slotProps) => {
					AlignLeft($$anchor, { size: 16, 'aria-hidden': 'true' });
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			ToggleGroupItem(node_1, {
				class: 'bg-primary/80 text-primary-foreground hover:bg-primary hover:text-primary-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
				'aria-label': 'Align Center',
				value: 'center',
				children: ($$anchor, $$slotProps) => {
					AlignCenter($$anchor, { size: 16, 'aria-hidden': 'true' });
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			ToggleGroupItem(node_2, {
				class: 'bg-primary/80 text-primary-foreground hover:bg-primary hover:text-primary-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
				'aria-label': 'Align Right',
				value: 'right',
				children: ($$anchor, $$slotProps) => {
					AlignRight($$anchor, { size: 16, 'aria-hidden': 'true' });
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			ToggleGroupItem(node_3, {
				class: 'bg-primary/80 text-primary-foreground hover:bg-primary hover:text-primary-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
				'aria-label': 'Align Justify',
				value: 'justify',
				children: ($$anchor, $$slotProps) => {
					AlignJustify($$anchor, { size: 16, 'aria-hidden': 'true' });
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}