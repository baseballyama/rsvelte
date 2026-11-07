import * as $ from 'svelte/internal/server';
import { Slider } from "bits-ui";
import { cn } from "$lib/utils/styles.js";

export default function Home_slider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = 5 } = $$props;

		$$renderer.push(`<div class="w-full">`);

		{
			function children($$renderer, { thumbItems }) {
				$$renderer.push(`<span class="bg-dark/10 relative h-[6px] w-full grow overflow-hidden rounded-full lg:h-2">`);

				if (Slider.Range) {
					$$renderer.push('<!--[-->');
					Slider.Range($$renderer, { class: 'bg-dark absolute h-full dark:bg-[#18181B]' });
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
							class: cn("bg-background shadow-mini hover:border-dark-40 dark:bg-foreground focus-visible:outline-hidden block size-[18px] cursor-pointer rounded-full transition-colors  active:scale-[0.98] lg:size-[25px] dark:shadow-[0px_0.7px_0px_0.7px_rgba(0,_0,_0,_0.04);]"),
							'aria-label': 'Speed'
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
					type: 'single',
					value,
					onValueCommit: (v) => value = v,
					class: 'shadow-mini-inset relative flex w-full touch-none select-none items-center rounded-full dark:bg-[rgba(244,244,245,0.1)] dark:shadow-[0px_0.7px_0px_0px_rgba(0,_0,_0,_0.04)_inset]',
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
		$.bind_props($$props, { value });
	});
}