import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';
import IconBrush from '@lucide/svelte/icons/brush';
import IconEraser from '@lucide/svelte/icons/eraser';
import IconScissors from '@lucide/svelte/icons/scissors';
import IconSwatchBook from '@lucide/svelte/icons/swatch-book';

var root = $.from_html(`<div class="border-input has-data-[state=checked]:border-ring relative flex flex-col gap-4 rounded-lg border p-4 shadow-xs shadow-black/[.04]"><div class="flex justify-between gap-2"><!> <!></div> <!></div>`);

export default function Radio_11($$anchor) {
	const items = [
		{
			Icon: IconSwatchBook,
			id: 'radio-11-r1',
			label: 'Palette',
			value: 'r1'
		},

		{
			Icon: IconBrush,
			id: 'radio-11-r2',
			label: 'Brush',
			value: 'r2'
		},

		{
			Icon: IconEraser,
			id: 'radio-11-r3',
			label: 'Eraser',
			value: 'r3'
		},

		{
			Icon: IconScissors,
			id: 'radio-11-r4',
			label: 'Cut',
			value: 'r4'
		}
	];

	let selectedValue = $.state('r1');

	RadioGroup($$anchor, {
		class: 'grid grid-cols-2 gap-2',
		get value() {
			return $.get(selectedValue);
		},

		set value($$value) {
			$.set(selectedValue, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 17, () => items, (item) => item.id, ($$anchor, item) => {
				var div = root();
				var div_1 = $.child(div);
				var node_1 = $.child(div_1);

				RadioGroupItem(node_1, {
					get id() {
						return $.get(item).id;
					},

					get value() {
						return $.get(item).value;
					},
					class: 'order-1 after:absolute after:inset-0'
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => $.get(item).Icon, ($$anchor, item_Icon) => {
					item_Icon($$anchor, { class: 'opacity-60', size: 16, 'aria-hidden': 'true' });
				});

				$.reset(div_1);

				var node_3 = $.sibling(div_1, 2);

				Label(node_3, {
					get for() {
						return $.get(item).id;
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, $.get(item).label));
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				$.reset(div);
				$.append($$anchor, div);
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}