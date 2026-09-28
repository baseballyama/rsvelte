import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';

var root = $.from_svg(`<circle class="svelte-732q9b"></circle>`);
var root_1 = $.from_svg(`<g class="dot-row"><line class="svelte-732q9b"></line><!></g>`);
var root_2 = $.from_svg(`<g class="dot-plot"></g>`);

export default function ClevelandDotPlot($$anchor, $$props) {
	$.push($$props, true);

	const $yScale = () => $.store_get(yScale, '$yScale', $$stores);
	const $data = () => $.store_get(data, '$data', $$stores);
	const $yGet = () => $.store_get(yGet, '$yGet', $$stores);
	const $xGet = () => $.store_get(xGet, '$xGet', $$stores);
	const $zScale = () => $.store_get(zScale, '$zScale', $$stores);
	const $config = () => $.store_get(config, '$config', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { data, xGet, yGet, yScale, zScale, config } = getContext('LayerCake');

	/**
	 * @typedef {Object} Props
	 * @property {number} [r=5] - The circle radius.
	 */
	/** @type {Props} */
	let r = $.prop($$props, 'r', 3, 5);

	let midHeight = $.derived(() => $yScale().bandwidth() / 2);
	var g = root_2();

	$.each(g, 5, $data, $.index, ($$anchor, row) => {
		const yVal = $.derived(() => $yGet()($.get(row)));
		const xVals = $.derived(() => $xGet()($.get(row)));
		var g_1 = root_1();
		var line = $.child(g_1);
		var node = $.sibling(line);

		$.each(node, 17, () => $.get(xVals), $.index, ($$anchor, circleX, i) => {
			var circle = root();

			$.template_effect(
				($0) => {
					$.set_attribute(circle, 'cx', $.get(circleX));
					$.set_attribute(circle, 'cy', $.get(yVal) + $.get(midHeight));
					$.set_attribute(circle, 'r', r());
					$.set_attribute(circle, 'fill', $0);
				},
				[() => $zScale()($config().x[i])]
			);

			$.append($$anchor, circle);
		});

		$.reset(g_1);

		$.template_effect(
			($0, $1) => {
				$.set_attribute(line, 'x1', $0);
				$.set_attribute(line, 'y1', $.get(yVal) + $.get(midHeight));
				$.set_attribute(line, 'x2', $1);
				$.set_attribute(line, 'y2', $.get(yVal) + $.get(midHeight));
			},
			[
				() => Math.min(...$.get(xVals)),
				() => Math.max(...$.get(xVals))
			]
		);

		$.append($$anchor, g_1);
	});

	$.reset(g);
	$.append($$anchor, g);
	$.pop();
	$$cleanup();
}