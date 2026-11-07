import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';

var root = $.from_html(`Label <span class="text-muted-foreground text-xs leading-[inherit] font-normal">(Sublabel)</span>`, 1);
var root_1 = $.from_html(`<div class="border-input has-data-[state=checked]:border-ring relative flex w-full items-start gap-2 rounded-lg border p-4 shadow-xs shadow-black/[.04]"><!> <div class="grid grow gap-2"><!> <p id="radio-08-r1-description" class="text-muted-foreground text-xs">You can use this card with a label and a description.</p></div></div> <div class="border-input has-data-[state=checked]:border-ring relative flex w-full items-start gap-2 rounded-lg border p-4 shadow-xs shadow-black/[.04]"><!> <div class="grid grow gap-2"><!> <p id="radio-08-r2-description" class="text-muted-foreground text-xs">You can use this card with a label and a description.</p></div></div>`, 1);

export default function Radio_08($$anchor) {
	RadioGroup($$anchor, {
		class: 'gap-2',
		value: 'r1',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			RadioGroupItem(node, {
				value: 'r1',
				id: 'radio-08-r1',
				'aria-describedby': 'radio-08-r1-description',
				class: 'order-1 after:absolute after:inset-0'
			});

			var div_1 = $.sibling(node, 2);
			var node_1 = $.child(div_1);

			Label(node_1, {
				for: 'radio-08-r1',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_2 = root();

					$.next();
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.next(2);
			$.reset(div_1);
			$.reset(div);

			var div_2 = $.sibling(div, 2);
			var node_2 = $.child(div_2);

			RadioGroupItem(node_2, {
				value: 'r2',
				id: 'radio-08-r2',
				'aria-describedby': 'radio-08-r2-description',
				class: 'order-1 after:absolute after:inset-0'
			});

			var div_3 = $.sibling(node_2, 2);
			var node_3 = $.child(div_3);

			Label(node_3, {
				for: 'radio-08-r2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_3 = root();

					$.next();
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.next(2);
			$.reset(div_3);
			$.reset(div_2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}