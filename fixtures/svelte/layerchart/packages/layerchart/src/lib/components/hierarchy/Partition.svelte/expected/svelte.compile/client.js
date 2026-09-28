import 'svelte/internal/disclose-version';
import { partition as d3Partition } from 'd3-hierarchy';
import * as $ from 'svelte/internal/client';
import { getChartContext } from '$lib/contexts/chart.js';

export default function Partition($$anchor, $$props) {
	$.push($$props, true);

	let orientation = $.prop($$props, 'orientation', 3, 'horizontal'),
		nodes = $.prop($$props, 'nodes', 15);

	const ctx = getChartContext();

	const partitionData = $.derived(() => {
		const h = $$props.hierarchy.copy();
		const _partition = d3Partition().size($$props.size ?? (orientation() === 'horizontal' ? [ctx.height, ctx.width] : [ctx.width, ctx.height]));

		if ($$props.padding) {
			_partition.padding($$props.padding);
		}

		if ($$props.round) {
			_partition.round($$props.round);
		}

		return _partition(h).descendants();
	});

	$.user_pre_effect(() => {
		nodes($.get(partitionData));
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop, () => ({ nodes: $.get(partitionData) }));
	$.append($$anchor, fragment);
	$.pop();
}