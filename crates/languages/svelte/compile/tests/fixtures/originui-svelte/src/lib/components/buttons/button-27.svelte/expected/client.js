import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import MinusIcon from '@lucide/svelte/icons/minus';
import PlusIcon from '@lucide/svelte/icons/plus';
import VolumeIcon from '@lucide/svelte/icons/volume';
import Volume1Icon from '@lucide/svelte/icons/volume-1';
import Volume2Icon from '@lucide/svelte/icons/volume-2';
import VolumeXIcon from '@lucide/svelte/icons/volume-x';

var root = $.from_html(`<div class="inline-flex items-center" role="group" aria-labelledby="volume-control"><span id="volume-control" class="sr-only">Volume Control</span> <!> <div class="flex items-center px-3 text-sm font-medium tabular-nums" aria-live="polite"><!> <span class="ms-2"> </span></div> <!></div>`);

export default function Button_27($$anchor) {
	let volume = $.state(3);

	function decreaseVolume() {
		$.set(volume, Math.max(0, $.get(volume) - 1), true);
	}

	function increaseVolume() {
		$.set(volume, Math.min(6, $.get(volume) + 1), true);
	}

	// Reactive volume icon selection
	const Icon = $.derived(() => $.get(volume) === 0
		? VolumeXIcon
		: $.get(volume) < 3
			? VolumeIcon
			: $.get(volume) < 5 ? Volume1Icon : Volume2Icon);

	var div = root();
	var node = $.sibling($.child(div), 2);

	{
		let $0 = $.derived(() => $.get(volume) === 0);

		Button(node, {
			class: 'rounded-full',
			variant: 'outline',
			size: 'icon',
			'aria-label': 'Decrease volume',
			onclick: decreaseVolume,
			get disabled() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				MinusIcon($$anchor, { size: 16, 'aria-hidden': 'true' });
			},
			$$slots: { default: true }
		});
	}

	var div_1 = $.sibling(node, 2);
	var node_1 = $.child(div_1);

	$.component(node_1, () => $.get(Icon), ($$anchor, Icon_1) => {
		Icon_1($$anchor, { class: 'opacity-60', size: 16, 'aria-hidden': 'true' });
	});

	var span = $.sibling(node_1, 2);
	var text = $.only_child(span, true);

	$.reset(div_1);

	var node_2 = $.sibling(div_1, 2);

	{
		let $0 = $.derived(() => $.get(volume) === 6);

		Button(node_2, {
			class: 'rounded-full',
			variant: 'outline',
			size: 'icon',
			'aria-label': 'Increase volume',
			onclick: increaseVolume,
			get disabled() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				PlusIcon($$anchor, { size: 16, 'aria-hidden': 'true' });
			},
			$$slots: { default: true }
		});
	}

	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(span, 'aria-label', `Current volume is ${$.get(volume) ?? ''}`);
		$.set_text(text, $.get(volume));
	});

	$.append($$anchor, div);
}