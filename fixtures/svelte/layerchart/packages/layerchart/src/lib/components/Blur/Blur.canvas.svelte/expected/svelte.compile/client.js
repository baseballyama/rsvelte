import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getChartContext } from '$lib/contexts/chart.js';

export default function Blur_canvas($$anchor, $$props) {
	$.push($$props, true);

	let stdDeviation = $.prop($$props, 'stdDeviation', 3, 5);
	const chartCtx = getChartContext();

	chartCtx.registerComponent({
		name: 'Blur',
		kind: 'group',
		canvasRender: {
			render: (ctx) => {
				ctx.filter = `blur(${stdDeviation()}px)`;
			},
			deps: () => [stdDeviation()]
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}