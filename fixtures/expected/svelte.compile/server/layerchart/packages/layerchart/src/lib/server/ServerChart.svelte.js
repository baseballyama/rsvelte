import * as $ from 'svelte/internal/server';
import Chart from '$lib/components/Chart/Chart.svelte';
import Canvas from '$lib/components/layers/Canvas.svelte';

export default function ServerChart($$renderer, $$props) {
	let {
		children,
		capture,
		onCapture,
		$$slots,
		$$events,
		...chartProps
	} = $$props;

	Chart($$renderer, $.spread_props([
		{ ssr: true },
		chartProps,
		{
			children: ($$renderer) => {
				Canvas($$renderer, {
					ssrCapture: capture,
					ssrCaptureCallback: onCapture,
					children: ($$renderer) => {
						if (children) {
							$$renderer.push('<!--[0-->');
							children($$renderer);
							$$renderer.push(`<!---->`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		}
	]));
}