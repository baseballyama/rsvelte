import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Checkbox from '$lib/components/ui/checkbox.svelte';
import Label from '$lib/components/ui/label.svelte';
import Brush from '@lucide/svelte/icons/brush';
import Eraser from '@lucide/svelte/icons/eraser';
import Scissors from '@lucide/svelte/icons/scissors';
import SwatchBook from '@lucide/svelte/icons/swatch-book';

var root = $.from_html(`<label class="border-input has-data-[state=checked]:border-ring relative flex cursor-pointer flex-col gap-4 rounded-lg border p-4 shadow-xs shadow-black/[.04]"><div class="flex justify-between gap-2"><!> <!></div> <!></label>`);
var root_1 = $.from_html(`<div class="grid grid-cols-2 gap-3"></div>`);

export default function Checkbox_16($$anchor) {
	const items = [
		{
			defaultChecked: true,
			Icon: SwatchBook,
			id: 'checkbox-16-c1',
			label: 'Palette',
			value: 'c1'
		},

		{
			Icon: Brush,
			id: 'checkbox-16-c2',
			label: 'Brush',
			value: 'c2'
		},

		{
			Icon: Eraser,
			id: 'checkbox-16-c3',
			label: 'Eraser',
			value: 'c3'
		},

		{
			Icon: Scissors,
			id: 'checkbox-16-c4',
			label: 'Cut',
			value: 'c4'
		}
	];

	var div = root_1();

	$.each(div, 21, () => items, (item) => item.id, ($$anchor, item) => {
		var label = root();
		var div_1 = $.child(label);
		var node = $.child(div_1);

		Checkbox(node, {
			get id() {
				return $.get(item).id;
			},

			get value() {
				return $.get(item).value;
			},
			class: 'order-1 h-4 w-4 after:absolute after:inset-0',
			get checked() {
				return $.get(item).defaultChecked;
			}
		});

		var node_1 = $.sibling(node, 2);

		$.component(node_1, () => $.get(item).Icon, ($$anchor, item_Icon) => {
			item_Icon($$anchor, { class: 'opacity-60', size: 16, 'aria-hidden': 'true' });
		});

		$.reset(div_1);

		var node_2 = $.sibling(div_1, 2);

		Label(node_2, {
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

		$.reset(label);
		$.template_effect(() => $.set_attribute(label, 'for', $.get(item).id));
		$.append($$anchor, label);
	});

	$.reset(div);
	$.append($$anchor, div);
}