import 'svelte/internal/disclose-version';
import { pack as d3Pack } from 'd3-hierarchy';
import * as $ from 'svelte/internal/client';
import { getChartContext } from '$lib/contexts/chart.js';

export default function Pack($$anchor, $$props) {
	$.push($$props, true);

	const ctx = getChartContext();
	let nodes = $.prop($$props, 'nodes', 15);

	const packedData = $.derived(() => {
		const h = $$props.hierarchy.copy();
		const _pack = d3Pack().size($$props.size ?? [ctx.width, ctx.height]);

		if ($$props.padding) {
			_pack.padding($$props.padding);
		}

		return _pack(h).descendants();
	});

	$.user_pre_effect(() => {
		nodes($.get(packedData));
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop, () => ({ nodes: $.get(packedData) }));
	$.append($$anchor, fragment);
	$.pop();
}