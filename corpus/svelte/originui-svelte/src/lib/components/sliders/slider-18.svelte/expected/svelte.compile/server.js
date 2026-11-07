import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import Slider from '$lib/components/ui/slider.svelte';

export default function Slider_18($$renderer) {
	const emojis = ['😡', '🙁', '😐', '🙂', '😍'];
	const labels = ['Awful', 'Poor', 'Okay', 'Good', 'Amazing'];
	let value = 3;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="*:not-first:mt-3">`);

		Label($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Rate your experience`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="flex items-center gap-3">`);

		Slider($$renderer, {
			type: 'single',
			min: 1,
			max: 5,
			showTooltip: true,
			tooltipContent: (value) => labels[value - 1],
			'aria-label': 'Rate your experience',
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <span class="text-2xl">${$.escape(emojis[value - 1])}</span></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}