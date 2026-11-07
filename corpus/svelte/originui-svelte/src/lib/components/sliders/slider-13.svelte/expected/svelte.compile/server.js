import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import Slider from '$lib/components/ui/slider.svelte';
import Volume2 from '@lucide/svelte/icons/volume-2';
import VolumeX from '@lucide/svelte/icons/volume-x';

export default function Slider_13($$renderer) {
	let value = 25;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="space-y-3"><div class="flex items-center justify-between gap-2">`);

		Label($$renderer, {
			class: 'leading-6',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Volume`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <output class="text-sm font-medium tabular-nums">${$.escape(value)}</output></div> <div class="flex items-center gap-2">`);

		VolumeX($$renderer, {
			class: 'shrink-0 opacity-60',
			size: 16,
			'aria-hidden': 'true'
		});

		$$renderer.push(`<!----> `);

		Slider($$renderer, {
			type: 'single',
			'aria-label': 'Volume slider',
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Volume2($$renderer, {
			class: 'shrink-0 opacity-60',
			size: 16,
			'aria-hidden': 'true'
		});

		$$renderer.push(`<!----></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}