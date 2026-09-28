import * as $ from 'svelte/internal/server';
import { Progress, useId } from "bits-ui";
import DemoContainer from "../demo-container.svelte";

export default function Progress_demo_custom($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { max = 100, value = 0, min = 0, label, valueLabel } = $$props;
		const labelId = useId();

		DemoContainer($$renderer, {
			size: 'xs',
			wrapperClass: 'rounded-bl-card rounded-br-card',
			children: ($$renderer) => {
				$$renderer.push(`<div class="flex w-[60%] flex-col gap-2"><div class="flex items-center justify-between text-sm font-medium"><span${$.attr('id', labelId)}>${$.escape(label)}</span> <span>${$.escape(valueLabel)}</span></div> `);

				if (Progress.Root) {
					$$renderer.push('<!--[-->');

					Progress.Root($$renderer, {
						'aria-labelledby': labelId,
						'aria-valuetext': valueLabel,
						value,
						min,
						max,
						class: 'bg-dark-10 shadow-mini-inset relative h-[15px] overflow-hidden rounded-full',
						children: ($$renderer) => {
							$$renderer.push(`<div class="bg-foreground shadow-mini-inset h-full w-full flex-1 rounded-full transition-all duration-1000 ease-in-out"${$.attr_style(`transform: translateX(-${100 - 100 * (value ?? 0) / max}%)`)}></div>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(`</div>`);
			},
			$$slots: { default: true }
		});
	});
}