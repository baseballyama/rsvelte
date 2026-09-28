import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';

var root = $.from_html(`<div class="flex items-center gap-2"><!> <!></div> <div class="flex items-center gap-2"><!> <!></div> <div class="flex items-center gap-2"><!> <!></div>`, 1);

export default function Radio_03($$anchor) {
	RadioGroup($$anchor, {
		value: 'r2',
		disabled: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			RadioGroupItem(node, { value: 'r1', id: 'radio-03-r1' });

			var node_1 = $.sibling(node, 2);

			Label(node_1, {
				for: 'radio-03-r1',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Option 1');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.reset(div);

			var div_1 = $.sibling(div, 2);
			var node_2 = $.child(div_1);

			RadioGroupItem(node_2, { value: 'r2', id: 'radio-03-r2' });

			var node_3 = $.sibling(node_2, 2);

			Label(node_3, {
				for: 'radio-03-r2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Option 2');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var node_4 = $.child(div_2);

			RadioGroupItem(node_4, { value: 'r3', id: 'radio-03-r3' });

			var node_5 = $.sibling(node_4, 2);

			Label(node_5, {
				for: 'radio-03-r3',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Option 3');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.reset(div_2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}