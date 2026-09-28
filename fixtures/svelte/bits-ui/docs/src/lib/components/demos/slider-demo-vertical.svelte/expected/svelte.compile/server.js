import * as $ from 'svelte/internal/server';
import { Slider } from "bits-ui";

export default function Slider_demo_vertical($$renderer) {
	let value = 50;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="flex h-[320px] w-full justify-center">`);

		if (Slider.Root) {
			$$renderer.push('<!--[-->');

			Slider.Root($$renderer, {
				type: 'single',
				step: 1,
				orientation: 'vertical',
				class: 'relative flex h-full touch-none select-none flex-col items-center',
				trackPadding: 3,
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<span class="bg-dark-10 relative h-full w-2 cursor-pointer overflow-hidden rounded-full">`);

					if (Slider.Range) {
						$$renderer.push('<!--[-->');
						Slider.Range($$renderer, { class: 'bg-foreground absolute w-full' });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</span> `);

					if (Slider.Thumb) {
						$$renderer.push('<!--[-->');

						Slider.Thumb($$renderer, {
							index: 0,
							class: 'border-border-input bg-background hover:border-dark-40 focus-visible:ring-foreground dark:bg-foreground dark:shadow-card data-active:border-dark-40 z-5 focus-visible:outline-hidden data-active:scale-[0.98] block size-[25px] cursor-pointer rounded-full border shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}