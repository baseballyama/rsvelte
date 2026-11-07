import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';

var root = $.from_html(`<label class="group-data-[state=on]:text-muted-foreground/70 relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-4 whitespace-nowrap">Bill Monthly <!></label> <label class="group-data-[state=off]:text-muted-foreground/70 relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-4 whitespace-nowrap"><span>Bill Yearly <span class="group-data-[state=on]:text-emerald-500">-20%</span></span> <!></label>`, 1);
var root_1 = $.from_html(`<div class="bg-input/50 inline-flex h-9 rounded-lg p-0.5"><!></div>`);

export default function Radio_19($$anchor) {
	let selectedValue = $.state('on');
	var div = root_1();
	var node = $.child(div);

	RadioGroup(node, {
		class: 'group after:bg-background after:ring-offset-background has-focus-visible:after:ring-ring relative inline-grid grid-cols-[1fr_1fr] items-center gap-0 text-sm font-medium after:absolute after:inset-y-0 after:w-1/2 after:rounded-md after:shadow-xs after:shadow-black/[.04] after:transition-transform after:duration-300 after:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] has-focus-visible:after:ring-2 has-focus-visible:after:ring-offset-2 data-[state=off]:after:translate-x-0 data-[state=on]:after:translate-x-full',
		get 'data-state'() {
			return $.get(selectedValue);
		},

		get value() {
			return $.get(selectedValue);
		},

		set value($$value) {
			$.set(selectedValue, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var label = $.first_child(fragment);
			var node_1 = $.sibling($.child(label));

			RadioGroupItem(node_1, { value: 'off', class: 'sr-only' });
			$.reset(label);

			var label_1 = $.sibling(label, 2);
			var node_2 = $.sibling($.child(label_1), 2);

			RadioGroupItem(node_2, { value: 'on', class: 'sr-only' });
			$.reset(label_1);
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}