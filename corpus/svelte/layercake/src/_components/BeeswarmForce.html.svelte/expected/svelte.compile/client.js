import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext, untrack } from 'svelte';
import { forceSimulation, forceX, forceY, forceCollide } from 'd3-force';

var root = $.from_html(`<div class="title svelte-1w8jvdv"> </div>`);
var root_1 = $.from_html(`<div class="bee svelte-1w8jvdv"><!></div>`);
var root_2 = $.from_html(`<div class="bee-group"></div>`);

export default function BeeswarmForce_html($$anchor, $$props) {
	$.push($$props, true);

	const $width = () => $.store_get(width, '$width', $$stores);
	const $height = () => $.store_get(height, '$height', $$stores);
	const $data = () => $.store_get(data, '$data', $$stores);
	const $xGet = () => $.store_get(xGet, '$xGet', $$stores);
	const $zGet = () => $.store_get(zGet, '$zGet', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { data, xGet, width, height, zGet } = getContext('LayerCake');

	/**
	 * @typedef {Object} Props
	 * @property {number} [r=4] - The circle radius size in pixels.
	 * @property {number} [strokeWidth=0.5] - The circle's stroke width in pixels.
	 * @property {string} [stroke='#fff'] - The circle's stroke color.
	 * @property {number} [xStrength=0.95] - The value passed into the `.strength` method on `forceX`, which is used as the `'x'` property on the simulation. See [the documentation](https://github.com/d3/d3-force#x_strength) for more.
	 * @property {number} [yStrength=0.075] - The value passed into the `.strength` method on `forceY`, which is used as the `'y'` property on the simulation. See [the documentation](https://github.com/d3/d3-force#y_strength) for more.
	 * @property {Function} [getTitle] - An accessor function to get the field on the data element to display as a hover label. Mostly useful for debugging, needs better styling for production.
	 */
	/** @type {Props} */
	let r = $.prop($$props, 'r', 3, 4),
		strokeWidth = $.prop($$props, 'strokeWidth', 3, 0.5),
		stroke = $.prop($$props, 'stroke', 3, '#fff'),
		xStrength = $.prop($$props, 'xStrength', 3, 0.95),
		yStrength = $.prop($$props, 'yStrength', 3, 0.075);

	/** @type {any[]} */
	let nodes = $.state($.proxy([]));

	let simulation = $.derived(() => {
		if (!$width() || !$height() || !$data().length) return null;

		const sim = forceSimulation($data().map((/** @type {any} */ d) => ({ ...d }))).force('x', forceX().x((d) => $xGet()(d)).strength(xStrength())).force('y', forceY().y($height() / 2).strength(yStrength())).force('collide', forceCollide(r())).stop();

		return sim;
	});

	$.user_effect(() => {
		if (!$.get(simulation)) {
			$.set(nodes, [], true);

			return;
		}

		untrack(() => {
			// Run the simulation for a fixed number of iterations
			const maxIterations = Math.ceil(Math.log($.get(simulation).alphaMin()) / Math.log(1 - $.get(simulation).alphaDecay()));

			for (let i = 0; i < maxIterations; ++i) {
				$.get(simulation).tick();
			}

			// Update nodes state to trigger reactivity
			$.set(nodes, [...$.get(simulation).nodes()], true);
		});
	});

	var div = root_2();

	$.each(div, 21, () => $.get(nodes), $.index, ($$anchor, node) => {
		var div_1 = root_1();
		var node_1 = $.child(div_1);

		{
			var consequent = ($$anchor) => {
				var div_2 = root();
				var text = $.only_child(div_2, true);

				$.template_effect(($0) => $.set_text(text, $0), [() => $$props.getTitle($.get(node))]);
				$.append($$anchor, div_2);
			};

			$.if(node_1, ($$render) => {
				if ($$props.getTitle) $$render(consequent);
			});
		}

		$.reset(div_1);

		$.template_effect(
			($0) => $.set_style(div_1, `
				left:${$.get(node).x ?? ''}px;
				top: ${$.get(node).y ?? ''}px;
				width: ${r() * 2}px;
				height: ${r() * 2}px;
				background: ${$0 ?? ''};
				border-width: ${strokeWidth() ?? ''}px;
				border-color: ${stroke() ?? ''};
				`),
			[() => $zGet()($.get(node))]
		);

		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}