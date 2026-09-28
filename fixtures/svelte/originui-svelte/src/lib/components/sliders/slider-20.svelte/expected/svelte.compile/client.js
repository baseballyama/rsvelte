import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import Label from '$lib/components/ui/label.svelte';
import Slider from '$lib/components/ui/slider.svelte';
import Minus from '@lucide/svelte/icons/minus';
import Plus from '@lucide/svelte/icons/plus';

var root = $.from_html(`<div class="*:not-first:mt-3"><!> <div class="flex items-center gap-4"><div><!></div> <!> <div><!></div></div></div>`);

export default function Slider_20($$anchor) {
	const min = 0;
	const max = 200;
	const steps = 5;
	let value = $.state(100);

	function decrement() {
		$.set(value, $.get(value) - steps);
	}

	function increment() {
		$.set(value, $.get(value) + steps);
	}

	var div = root();
	var node = $.child(div);

	Label(node, {
		class: 'tabular-nums',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, `${$.get(value) ?? ''} credits/mo`));
			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 2);
	var div_2 = $.child(div_1);
	var node_1 = $.child(div_2);

	{
		let $0 = $.derived(() => $.get(value) === min);

		Button(node_1, {
			variant: 'outline',
			size: 'icon',
			class: 'size-8',
			'aria-label': 'Decrease value',
			get disabled() {
				return $.get($0);
			},
			onclick: decrement,
			children: ($$anchor, $$slotProps) => {
				Minus($$anchor, { size: 16, 'aria-hidden': 'true' });
			},
			$$slots: { default: true }
		});
	}

	$.reset(div_2);

	var node_2 = $.sibling(div_2, 2);

	Slider(node_2, {
		type: 'single',
		class: 'grow',
		min,
		max,
		step: steps,
		'aria-label': 'Dual range slider with buttons',
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});

	var div_3 = $.sibling(node_2, 2);
	var node_3 = $.child(div_3);

	{
		let $0 = $.derived(() => $.get(value) === max);

		Button(node_3, {
			variant: 'outline',
			size: 'icon',
			class: 'size-8',
			'aria-label': 'Increase value',
			get disabled() {
				return $.get($0);
			},
			onclick: increment,
			children: ($$anchor, $$slotProps) => {
				Plus($$anchor, { size: 16, 'aria-hidden': 'true' });
			},
			$$slots: { default: true }
		});
	}

	$.reset(div_3);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}