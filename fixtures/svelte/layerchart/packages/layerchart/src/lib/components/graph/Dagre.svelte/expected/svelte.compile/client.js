import 'svelte/internal/disclose-version';
import dagre from '@dagrejs/dagre';
import { dagreGraph } from '$lib/utils/graph/dagre.js';
import * as $ from 'svelte/internal/client';
import { getChartContext } from '$lib/contexts/chart.js';

export const RankDir = {
	'top-bottom': 'TB',
	'bottom-top': 'BT',
	'left-right': 'LR',
	'right-left': 'RL'
};

export const Align = {
	none: undefined,
	'up-left': 'UL',
	'up-right': 'UR',
	'down-left': 'DL',
	'down-right': 'DR'
};

export const EdgeLabelPosition = { left: 'l', center: 'c', right: 'r' };

export default function Dagre($$anchor, $$props) {
	$.push($$props, true);

	const ctx = getChartContext();

	ctx.registerComponent({ name: 'Dagre', kind: 'composite-mark' });

	let nodes = $.prop($$props, 'nodes', 3, (d) => d.nodes),
		nodeId = $.prop($$props, 'nodeId', 3, (d) => d.id),
		edges = $.prop($$props, 'edges', 3, (d) => d.edges),
		directed = $.prop($$props, 'directed', 3, true),
		multigraph = $.prop($$props, 'multigraph', 3, false),
		compound = $.prop($$props, 'compound', 3, false),
		ranker = $.prop($$props, 'ranker', 3, 'network-simplex'),
		direction = $.prop($$props, 'direction', 3, 'top-bottom'),
		rankSeparation = $.prop($$props, 'rankSeparation', 3, 50),
		nodeSeparation = $.prop($$props, 'nodeSeparation', 3, 50),
		edgeSeparation = $.prop($$props, 'edgeSeparation', 3, 10),
		nodeWidth = $.prop($$props, 'nodeWidth', 3, 100),
		nodeHeight = $.prop($$props, 'nodeHeight', 3, 50),
		edgeLabelWidth = $.prop($$props, 'edgeLabelWidth', 3, 100),
		edgeLabelHeight = $.prop($$props, 'edgeLabelHeight', 3, 20),
		edgeLabelPosition = $.prop($$props, 'edgeLabelPosition', 3, 'center'),
		edgeLabelOffset = $.prop($$props, 'edgeLabelOffset', 3, 10),
		filterNodes = $.prop($$props, 'filterNodes', 3, () => true),
		graphProp = $.prop($$props, 'graph', 15);

	const graph = $.derived(() => dagreGraph($$props.data, {
		nodes: nodes(),
		nodeId: nodeId(),
		edges: edges(),
		directed: directed(),
		multigraph: multigraph(),
		compound: compound(),
		ranker: ranker(),
		direction: direction(),
		align: $$props.align,
		rankSeparation: rankSeparation(),
		nodeSeparation: nodeSeparation(),
		edgeSeparation: edgeSeparation(),
		nodeWidth: nodeWidth(),
		nodeHeight: nodeHeight(),
		edgeLabelWidth: edgeLabelWidth(),
		edgeLabelHeight: edgeLabelHeight(),
		edgeLabelPosition: edgeLabelPosition(),
		edgeLabelOffset: edgeLabelOffset(),
		filterNodes: filterNodes()
	}));

	$.user_pre_effect(() => {
		graphProp($.get(graph));
	});

	const graphNodes = $.derived(() => {
		if (typeof document === 'undefined' || !$.get(graph)) return [];

		return $.get(graph).nodes().map((id) => $.get(graph).node(id));
	});

	const graphEdges = $.derived(() => {
		if (typeof document === 'undefined' || !$.get(graph)) return [];

		return $.get(graph).edges().map((edge) => ({ ...edge, ...$.get(graph).edge(edge) }));
		// `EdgeConfig` is excluded when inferred from usage
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop, () => ({
		nodes: $.get(graphNodes),
		edges: $.get(graphEdges),
		graph: $.get(graph)
	}));

	$.append($$anchor, fragment);
	$.pop();
}