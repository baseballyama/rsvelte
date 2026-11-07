import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';

var root = $.from_html(`<label class="border-input ring-offset-background has-data-[state=checked]:border-ring has-data-[state=checked]:bg-accent has-focus-visible:ring-ring/70 relative flex size-9 cursor-pointer flex-col items-center justify-center rounded-full border text-center text-xl shadow-xs shadow-black/[.04] transition-colors has-focus-visible:ring-2 has-focus-visible:ring-offset-2 has-disabled:cursor-not-allowed has-disabled:opacity-50"><!> </label>`);
var root_1 = $.from_html(`<fieldset class="space-y-4"><legend class="text-foreground text-sm leading-none font-medium">How did it go?</legend> <!></fieldset>`);

export default function Radio_16($$anchor) {
	const items = [
		{ icon: '😠', id: 'radio-16-r1', label: 'Angry', value: 'r1' },
		{ icon: '🙁', id: 'radio-16-r2', label: 'Sad', value: 'r2' },
		{ icon: '😐', id: 'radio-16-r3', label: 'Neutral', value: 'r3' },
		{ icon: '🙂', id: 'radio-16-r4', label: 'Happy', value: 'r4' },
		{
			icon: '😀',
			id: 'radio-16-r5',
			label: 'Laughing',
			value: 'r5'
		}
	];

	let selectedValue = $.state('r3');
	var fieldset = root_1();
	var node = $.sibling($.child(fieldset), 2);

	RadioGroup(node, {
		class: 'flex gap-1.5',
		get value() {
			return $.get(selectedValue);
		},

		set value($$value) {
			$.set(selectedValue, $$value, true);
		},

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
					class: 'sr-only after:absolute after:inset-0'
				});

				var text = $.sibling(node_2);

				$.reset(label);
				$.template_effect(() => $.set_text(text, ` ${$.get(item).icon ?? ''}`));
				$.append($$anchor, label);
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(fieldset);
	$.append($$anchor, fieldset);
}