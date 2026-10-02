import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, onDestroy, untrack } from 'svelte';
import { Chart as ChartJS } from 'chart.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'type',
	'data',
	'options',
	'plugins',
	'updateMode',
	'chart'
]);

var root = $.from_html(`<canvas></canvas>`);

export default function Chart($$anchor, $$props) {
	$.push($$props, true);

	let chart = $.prop($$props, 'chart', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	let canvasRef;

	/** Removes svelte deep reactivity from an object */
	function freeze(value) {
		return $.snapshot(value);
	}

	onMount(() => {
		chart(new ChartJS(canvasRef, freeze({
			type: $$props.type,
			data: $$props.data,
			options: $$props.options,
			plugins: $$props.plugins
		})));
	});

	$.user_effect(() => {
		const frozenData = freeze($$props.data);
		const frozenOptions = freeze($$props.options);
		const frozenUpdateMode = freeze($$props.updateMode);
		const currentChart = untrack(() => chart());

		if (!currentChart) return;

		currentChart.data = frozenData;

		if (currentChart.options && frozenOptions) {
			Object.assign(currentChart.options, frozenOptions);
		}

		currentChart.update(frozenUpdateMode);
	});

	onDestroy(() => {
		if (chart()) chart().destroy();

		chart(null);
	});

	var canvas = root();

	$.attribute_effect(canvas, () => ({ ...restProps }));
	$.bind_this(canvas, ($$value) => canvasRef = $$value, () => canvasRef);
	$.append($$anchor, canvas);
	$.pop();
}