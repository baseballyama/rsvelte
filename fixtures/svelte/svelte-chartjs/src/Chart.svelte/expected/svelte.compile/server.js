import * as $ from 'svelte/internal/server';
import { onMount, onDestroy, untrack } from 'svelte';
import { Chart as ChartJS } from 'chart.js';

export default function Chart($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			type,
			data,
			options,
			plugins,
			updateMode,
			chart = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let canvasRef;

		/** Removes svelte deep reactivity from an object */
		function freeze(value) {
			return $.snapshot(value);
		}

		onMount(() => {
			chart = new ChartJS(canvasRef, freeze({ type, data, options, plugins }));
		});

		onDestroy(() => {
			if (chart) chart.destroy();

			chart = null;
		});

		$$renderer.push(`<canvas${$.attributes({ ...restProps })}></canvas>`);
		$.bind_props($$props, { chart });
	});
}