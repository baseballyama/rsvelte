import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';

var root = $.from_svg(`<rect class="group-rect"></rect>`);
var root_1 = $.from_svg(`<g class="bar-group"></g>`);

export default function Bar($$anchor, $$props) {
	$.push($$props, true);

	const $data = () => $.store_get(data, '$data', $$stores);
	const $xScale = () => $.store_get(xScale, '$xScale', $$stores);
	const $yGet = () => $.store_get(yGet, '$yGet', $$stores);
	const $yScale = () => $.store_get(yScale, '$yScale', $$stores);
	const $xGet = () => $.store_get(xGet, '$xGet', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { data, xGet, yGet, xScale, yScale } = getContext('LayerCake');

	/**
	 * @typedef {Object} Props
	 * @property {string} [fill='#00bbff'] - The shape's fill color. This is technically optional because it comes with a default value but you'll likely want to replace it with your own color.
	 */
	/** @type {Props} */
	let fill = $.prop($$props, 'fill', 3, '#00bbff');

	var g = root_1();

	$.each(g, 5, $data, $.index, ($$anchor, d, i) => {
		var rect = root();

		$.set_attribute(rect, 'data-id', i);

		$.template_effect(
			($0, $1, $2, $3) => {
				$.set_attribute(rect, 'x', $0);
				$.set_attribute(rect, 'y', $1);
				$.set_attribute(rect, 'height', $2);
				$.set_attribute(rect, 'width', $3);
				$.set_attribute(rect, 'fill', fill());
			},
			[
				() => $xScale().range()[0],
				() => $yGet()($.get(d)),
				() => $yScale().bandwidth(),
				() => $xGet()($.get(d))
			]
		);

		$.append($$anchor, rect);
	});

	$.reset(g);
	$.append($$anchor, g);
	$.pop();
	$$cleanup();
}