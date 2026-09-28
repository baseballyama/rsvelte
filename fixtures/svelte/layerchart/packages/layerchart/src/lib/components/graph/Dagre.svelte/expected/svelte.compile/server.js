import * as $ from 'svelte/internal/server';
import { getChartContext } from '$lib/contexts/chart.js';
import dagre from '@dagrejs/dagre';
import { dagreGraph } from '$lib/utils/graph/dagre.js';

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

export default function Dagre($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const ctx = getChartContext();

		ctx.registerComponent({ name: 'Dagre', kind: 'composite-mark' });

		let {
			data,
			nodes = (d) => d.nodes,
			nodeId = (d) => d.id,
			edges = (d) => d.edges,
			directed = true,
			multigraph = false,
			compound = false,
			ranker = 'network-simplex',
			direction = 'top-bottom',
			align,
			rankSeparation = 50,
			nodeSeparation = 50,
			edgeSeparation = 10,
			nodeWidth = 100,
			nodeHeight = 50,
			edgeLabelWidth = 100,
			edgeLabelHeight = 20,
			edgeLabelPosition = 'center',
			edgeLabelOffset = 10,
			filterNodes = () => true,
			graph: graphProp = void 0,
			children
		} = $$props;

		const graph = $.derived(() => dagreGraph(data, {
			nodes,
			nodeId,
			edges,
			directed,
			multigraph,
			compound,
			ranker,
			direction,
			align,
			rankSeparation,
			nodeSeparation,
			edgeSeparation,
			nodeWidth,
			nodeHeight,
			edgeLabelWidth,
			edgeLabelHeight,
			edgeLabelPosition,
			edgeLabelOffset,
			filterNodes
		}));

		const graphNodes = $.derived(() => {
			if (typeof document === 'undefined' || !graph()) return [];

			return graph().nodes().map((id) => graph().node(id));
		});

		const graphEdges = $.derived(() => {
			if (typeof document === 'undefined' || !graph()) return [];

			return graph().edges().map((edge) => ({ ...edge, ...graph().edge(edge) }));
			// `EdgeConfig` is excluded when inferred from usage
		});

		children?.($$renderer, { nodes: graphNodes(), edges: graphEdges(), graph: graph() });
		$$renderer.push(`<!---->`);
		$.bind_props($$props, { graph: graphProp });
	});
}