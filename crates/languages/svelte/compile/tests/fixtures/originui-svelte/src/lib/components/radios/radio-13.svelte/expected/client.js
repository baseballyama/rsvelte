import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';

var root = $.from_html(`<label class="border-input ring-offset-background has-data-[state=checked]:border-ring has-data-[state=checked]:bg-accent has-focus-visible:ring-ring/70 relative flex cursor-pointer flex-col items-center gap-3 rounded-lg border px-2 py-3 text-center shadow-xs shadow-black/[.04] transition-colors has-focus-visible:ring-2 has-focus-visible:ring-offset-2 has-disabled:cursor-not-allowed has-disabled:opacity-50"><!> <p class="text-foreground text-sm leading-none font-medium"> </p></label>`);
var root_1 = $.from_html(`<fieldset class="space-y-4"><legend class="text-foreground text-sm leading-none font-medium">CPU Cores</legend> <!></fieldset>`);

export default function Radio_13($$anchor) {
	const items = [
		{ id: 'radio-13-r1', label: '2 CPU', value: 'r1' },
		{ id: 'radio-13-r2', label: '4 CPU', value: 'r2' },
		{ id: 'radio-13-r3', label: '6 CPU', value: 'r3' },
		{ id: 'radio-13-r4', label: '8 CPU', value: 'r4' },
		{ id: 'radio-13-r5', label: '12 CPU', value: 'r5' },
		{
			disabled: true,
			id: 'radio-13-r6',
			label: '16 CPU',
			value: 'r6'
		}
	];

	var fieldset = root_1();
	var node = $.sibling($.child(fieldset), 2);

	RadioGroup(node, {
		class: 'grid grid-cols-3 gap-2',
		value: 'r1',
		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.each(node_1, 17, () => items, (item) => item.id, ($$anchor, item) => {
				var label = root();
				var node_2 = $.child(label);

				RadioGroupItem(node_2, {
					get id() {
						return $.get(item).id;
					},

					get value() {
						return $.get(item).value;
					},
					class: 'sr-only after:absolute after:inset-0',
					get disabled() {
						return $.get(item).disabled;
					}
				});

				var p = $.sibling(node_2, 2);
				var text = $.only_child(p, true);

				$.reset(label);
				$.template_effect(() => $.set_text(text, $.get(item).label));
				$.append($$anchor, label);
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(fieldset);
	$.append($$anchor, fieldset);
}