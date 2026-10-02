import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import MinusIcon from '@lucide/svelte/icons/minus';
import PlusIcon from '@lucide/svelte/icons/plus';
import VolumeIcon from '@lucide/svelte/icons/volume';
import Volume1Icon from '@lucide/svelte/icons/volume-1';
import Volume2Icon from '@lucide/svelte/icons/volume-2';
import VolumeXIcon from '@lucide/svelte/icons/volume-x';

export default function Button_27($$renderer) {
	let volume = 3;

	function decreaseVolume() {
		volume = Math.max(0, volume - 1);
	}

	function increaseVolume() {
		volume = Math.min(6, volume + 1);
	}

	// Reactive volume icon selection
	const Icon = $.derived(() => volume === 0
		? VolumeXIcon
		: volume < 3 ? VolumeIcon : volume < 5 ? Volume1Icon : Volume2Icon);

	$$renderer.push(`<div class="inline-flex items-center" role="group" aria-labelledby="volume-control"><span id="volume-control" class="sr-only">Volume Control</span> `);

	Button($$renderer, {
		class: 'rounded-full',
		variant: 'outline',
		size: 'icon',
		'aria-label': 'Decrease volume',
		onclick: decreaseVolume,
		disabled: volume === 0,
		children: ($$renderer) => {
			MinusIcon($$renderer, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="flex items-center px-3 text-sm font-medium tabular-nums" aria-live="polite">`);

	if (Icon()) {
		$$renderer.push('<!--[-->');
		Icon()($$renderer, { class: 'opacity-60', size: 16, 'aria-hidden': 'true' });
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` <span class="ms-2"${$.attr('aria-label', `Current volume is ${$.stringify(volume)}`)}>${$.escape(volume)}</span></div> `);

	Button($$renderer, {
		class: 'rounded-full',
		variant: 'outline',
		size: 'icon',
		'aria-label': 'Increase volume',
		onclick: increaseVolume,
		disabled: volume === 6,
		children: ($$renderer) => {
			PlusIcon($$renderer, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}