import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';

import {
	forceSimulation,
	forceX,
	forceManyBody,
	forceCollide,
	forceCenter
} from 'd3-force';

var root = $.from_svg(`<circle class="node"></circle>`);

export default function CirclePackForce($$anchor, $$props) {
	$.push($$props, true);

	const $data = () => $.store_get(data, '$data', $$stores);
	const $xGet = () => $.store_get(xGet, '$xGet', $$stores);
	const $xScale = () => $.store_get(xScale, '$xScale', $$stores);
	const $width = () => $.store_get(width, '$width', $$stores);
	const $height = () => $.store_get(height, '$height', $$stores);
	const $rGet = () => $.store_get(rGet, '$rGet', $$stores);
	const $zGet = () => $.store_get(zGet, '$zGet', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { data, width, height, xScale, xGet, rGet, zGet } = getContext('LayerCake');

	/**
	 * @typedef {Object} Props
	 * @property {number} [manyBodyStrength=5] - The value passed into the `.strength` method on `forceManyBody`, which is used as the `'charge'` property on the simulation. See [the documentation](https://github.com/d3/d3-force#manyBody_strength) for more.
	 * @property {number} [xStrength=0.1] - The value passed into the `.strength` method on `forceX`, which is used as the `'x'` property on the simulation. See [the documentation](https://github.com/d3/d3-force#x_strength) for more.
	 * @property {string|undefined} [nodeColor] - Set a color manually otherwise it will default to the `zScale`.
	 * @property {string} [nodeStroke='#fff'] - The circle's stroke color.
	 * @property {number} [nodeStrokeWidth=1] - The circle's stroke width, in pixels.
	 * @property {boolean} [groupBy=true] - Group the nodes by the return value of the x-scale. If `false`, align all the nodes to the canvas center.
	 */
	/** @type {Props} */
	let manyBodyStrength = $.prop($$props, 'manyBodyStrength', 3, 5),
		xStrength = $.prop($$props, 'xStrength', 3, 0.1),
		nodeStroke = $.prop($$props, 'nodeStroke', 3, '#fff'),
		nodeStrokeWidth = $.prop($$props, 'nodeStrokeWidth', 3, 1),
		groupBy = $.prop($$props, 'groupBy', 3, true);

	/* --------------------------------------------
	 * Make a copy because the simulation will alter the objects
	 */
	const initialNodes = $data().map((d) => ({ ...d }));

	const simulation = forceSimulation(initialNodes);
	let nodes = $.state($.proxy([]));

	simulation.on('tick', () => {
		$.set(nodes, simulation.nodes(), true);
	});

	/* ----------------------------------------------
	 * When variables change, set forces and restart the simulation
	 */
	$.user_effect(() => {
		simulation.force('x', forceX().x(/** @param {any} d */ (d) => {
			return groupBy() === true ? $xGet()(d) + $xScale().bandwidth() / 2 : $width() / 2;
		}).strength(xStrength())).force('center', forceCenter($width() / 2, $height() / 2)).force('charge', forceManyBody().strength(manyBodyStrength())).force('collision', forceCollide().radius(/** @param {any} d */ (d) => {
			return $rGet()(d) + nodeStrokeWidth() / 2; // Divide this by two because an svg stroke is drawn halfway out
		})).force('center', forceCenter($width() / 2, $height() / 2)).alpha(1).restart();
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => $.get(nodes), $.index, ($$anchor, point) => {
		var circle = root();

		$.template_effect(
			($0, $1) => {
				$.set_attribute(circle, 'r', $0);
				$.set_attribute(circle, 'fill', $1);
				$.set_attribute(circle, 'stroke', nodeStroke());
				$.set_attribute(circle, 'stroke-width', nodeStrokeWidth());
				$.set_attribute(circle, 'cx', $.get(point).x);
				$.set_attribute(circle, 'cy', $.get(point).y);
			},
			[
				() => $rGet()($.get(point)),
				() => $$props.nodeColor || $zGet()($.get(point))
			]
		);

		$.append($$anchor, circle);
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}