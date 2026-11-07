import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group';

var root = $.from_html(`<label class="group-data-[state=on]:text-muted-foreground/70 relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-3 whitespace-nowrap transition-colors select-none">Sitemap <!></label> <label class="group-data-[state=off]:text-muted-foreground/70 relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-3 whitespace-nowrap transition-colors select-none">Wireframe <!></label>`, 1);
var root_1 = $.from_html(`<div class="bg-input/50 inline-flex h-8 rounded-md p-0.5"><!></div>`);

export default function App_toggle($$anchor) {
	const id = $.props_id();
	let selectedValue = $.state('off');
	var div = root_1();
	var node = $.child(div);

	RadioGroup(node, {
		get value() {
			return $.get(selectedValue);
		},

		onValueChange: (value) => {
			$.set(selectedValue, value, true);
		},
		class: 'group after:bg-background [&:has(:focus-visible)]:after:border-ring [&:has(:focus-visible)]:after:ring-ring/50 relative inline-grid grid-cols-[1fr_1fr] items-center gap-0 text-sm font-medium after:absolute after:inset-y-0 after:w-1/2 after:rounded-sm after:shadow-xs after:transition-[transform,box-shadow] after:duration-300 after:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] data-[state=off]:after:translate-x-0 data-[state=on]:after:translate-x-full [&:has(:focus-visible)]:after:ring-[3px]',
		get 'data-state'() {
			return $.get(selectedValue);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var label = $.first_child(fragment);
			var node_1 = $.sibling($.child(label));

			RadioGroupItem(node_1, {
				get id() {
					return `${id}-1`;
				},
				value: 'off',
				class: 'sr-only'
			});

			$.reset(label);

			var label_1 = $.sibling(label, 2);
			var node_2 = $.sibling($.child(label_1));

			RadioGroupItem(node_2, {
				get id() {
					return `${id}-2`;
				},
				value: 'on',
				class: 'sr-only'
			});

			$.reset(label_1);
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}