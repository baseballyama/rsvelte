import * as $ from 'svelte/internal/server';
import { Slider } from "bits-ui";
import { cn } from "$lib/utils/styles.js";

export default function Slider_demo_multiple($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = [25, 75];
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="w-full md:max-w-[280px]">`);

			{
				function children($$renderer, { thumbItems }) {
					$$renderer.push(`<span class="bg-dark-10 relative h-2 w-full grow cursor-pointer overflow-hidden rounded-full">`);

					if (Slider.Range) {
						$$renderer.push('<!--[-->');
						Slider.Range($$renderer, { class: 'bg-foreground absolute h-full' });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</span> <!--[-->`);

					const each_array = $.ensure_array_like(thumbItems);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let { index } = each_array[$$index];

						if (Slider.Thumb) {
							$$renderer.push('<!--[-->');

							Slider.Thumb($$renderer, {
								index,
								class: cn("border-border-input bg-background hover:border-dark-40 focus-visible:ring-foreground dark:bg-foreground dark:shadow-card data-active:border-dark-40 focus-visible:outline-hidden data-active:scale-[0.98] block size-[25px] cursor-pointer rounded-full border shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50")
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					$$renderer.push(`<!--]-->`);
				}

				if (Slider.Root) {
					$$renderer.push('<!--[-->');

					Slider.Root($$renderer, {
						type: 'multiple',
						class: 'relative flex w-full touch-none select-none items-center',
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						},
						children,
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			$$renderer.push(`</div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}