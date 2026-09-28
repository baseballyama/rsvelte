import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/button.svelte';
import * as NumberField from '$lib/components/ui/number-field';
import CheckIcon from '@lucide/svelte/icons/check';
import SkipForwardIcon from '@lucide/svelte/icons/skip-forward';
import FireIcon from '@lucide/svelte/icons/flame';

var root = $.from_html(`<div class="flex flex-col items-center"><div class="flex w-full min-w-[230px] items-center justify-between gap-4 py-4"><!> <span class="flex items-center gap-2 text-center text-3xl"><!> <span class="font-mono"> </span></span> <!></div></div>`);
var root_1 = $.from_html(`<div class="flex flex-col gap-2"><div><h1 class="text-lg font-medium">Calories Burned</h1> <p class="text-muted-foreground text-sm">How many calories did you burn?</p></div> <!> <div class="flex items-center justify-between gap-4"><!> <!></div></div>`);

export default function Number_field_step($$anchor) {
	let calories = $.state(0);
	var div = root_1();
	var node = $.sibling($.child(div), 2);

	$.component(node, () => NumberField.Root, ($$anchor, NumberField_Root) => {
		NumberField_Root($$anchor, {
			step: 100,
			min: 0,
			max: 10000,
			get value() {
				return $.get(calories);
			},

			set value($$value) {
				$.set(calories, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var div_1 = root();
				var div_2 = $.child(div_1);
				var node_1 = $.child(div_2);

				$.component(node_1, () => NumberField.Decrement, ($$anchor, NumberField_Decrement) => {
					NumberField_Decrement($$anchor, { variant: 'outline', class: 'rounded-full', tabindex: null });
				});

				var span = $.sibling(node_1, 2);
				var node_2 = $.child(span);

				FireIcon(node_2, { class: 'size-7 text-amber-500' });

				var span_1 = $.sibling(node_2, 2);
				var text = $.only_child(span_1, true);

				$.reset(span);

				var node_3 = $.sibling(span, 2);

				$.component(node_3, () => NumberField.Increment, ($$anchor, NumberField_Increment) => {
					NumberField_Increment($$anchor, { variant: 'outline', class: 'rounded-full', tabindex: null });
				});

				$.reset(div_2);
				$.reset(div_1);
				$.template_effect(() => $.set_text(text, $.get(calories)));
				$.append($$anchor, div_1);
			},
			$$slots: { default: true }
		});
	});

	var div_3 = $.sibling(node, 2);
	var node_4 = $.child(div_3);

	Button(node_4, {
		variant: 'outline',
		size: 'icon',
		children: ($$anchor, $$slotProps) => {
			SkipForwardIcon($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Button(node_5, {
		size: 'icon',
		children: ($$anchor, $$slotProps) => {
			CheckIcon($$anchor, {});
		},
		$$slots: { default: true }
	});

	$.reset(div_3);
	$.reset(div);
	$.append($$anchor, div);
}