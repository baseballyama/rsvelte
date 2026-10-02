import * as $ from 'svelte/internal/server';
import DemoContainer from "../demo-container.svelte";
import TooltipDemoCustom from "./tooltip-demo-custom.svelte";

export default function Tooltip_demo_delay_duration($$renderer) {
	const durations = [200, 1000, 2500];

	DemoContainer($$renderer, {
		size: 'sm',
		wrapperClass: 'rounded-bl-card rounded-br-card',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex w-full flex-col items-center justify-between gap-4 lg:flex-row"><!--[-->`);

			const each_array = $.ensure_array_like(durations);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let duration = each_array[$$index];

				$$renderer.push(`<div class="flex flex-col items-center gap-3">`);
				TooltipDemoCustom($$renderer, { delayDuration: duration });
				$$renderer.push(`<!----> <pre>delayDuration=${$.escape(duration)}</pre></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		},
		$$slots: { default: true }
	});
}