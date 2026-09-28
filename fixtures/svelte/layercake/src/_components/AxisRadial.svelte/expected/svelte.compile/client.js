import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';

var root = $.from_svg(`<line x1="0" y1="0" stroke="#ccc" stroke-width="1" fill="none"></line><text dy="0.35em" font-size="12px"> </text>`, 1);
var root_1 = $.from_svg(`<g><circle cx="0" cy="0" stroke="#ccc" stroke-width="1" fill="#CDCDCD" fill-opacity="0.1"></circle><circle cx="0" cy="0" stroke="#ccc" stroke-width="1" fill="none"></circle><!></g>`);

export default function AxisRadial($$anchor, $$props) {
	$.push($$props, true);

	const $xScale = () => $.store_get(xScale, '$xScale', $$stores);
	const $extents = () => $.store_get(extents, '$extents', $$stores);
	const $config = () => $.store_get(config, '$config', $$stores);
	const $width = () => $.store_get(width, '$width', $$stores);
	const $height = () => $.store_get(height, '$height', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { width, height, xScale, extents, config } = getContext('LayerCake');

	/**
	 * @typedef {Object} Props
	 * @property {number} [lineLengthFactor=1.1] - How far to extend the lines from the circle's center. A value of `1` puts them at the circle's circumference.
	 * @property {number} [labelPlacementFactor=1.25] - How far to place the labels from the circle's center. A value of `1` puts them at the circle's circumference.
	 */
	/** @type {Props} */
	let lineLengthFactor = $.prop($$props, 'lineLengthFactor', 3, 1.1),
		labelPlacementFactor = $.prop($$props, 'labelPlacementFactor', 3, 1.25);

	let max = $.derived(() => $xScale()(Math.max(...$extents().x)));
	let lineLength = $.derived(() => $.get(max) * lineLengthFactor());
	let labelPlacement = $.derived(() => $.get(max) * labelPlacementFactor());
	let angleSlice = $.derived(() => Math.PI * 2 / $config().x.length);

	/** @param {number} total
	 *  @param {number} i */
	function anchor(total, i) {
		if (i === 0 || i === total / 2) {
			return 'middle';
		} else if (i < total / 2) {
			return 'start';
		}

		return 'end';
	}

	var g = root_1();
	var circle = $.child(g);
	var circle_1 = $.sibling(circle);
	var node = $.sibling(circle_1);

	$.each(node, 1, () => $config().x, $.index, ($$anchor, label, i) => {
		const thisAngleSlice = $.derived(() => $.get(angleSlice) * i - Math.PI / 2);
		var fragment = root();
		var line = $.first_child(fragment);
		var text = $.sibling(line);
		var text_1 = $.only_child(text, true);

		$.template_effect(
			($0, $1, $2, $3, $4) => {
				$.set_attribute(line, 'x2', $0);
				$.set_attribute(line, 'y2', $1);
				$.set_attribute(text, 'text-anchor', $2);
				$.set_attribute(text, 'transform', `translate(${$3 ?? ''}, ${$4 ?? ''})`);
				$.set_text(text_1, $.get(label));
			},
			[
				() => $.get(lineLength) * Math.cos($.get(thisAngleSlice)),
				() => $.get(lineLength) * Math.sin($.get(thisAngleSlice)),
				() => anchor($config().x.length, i),
				() => $.get(labelPlacement) * Math.cos($.get(thisAngleSlice)),
				() => $.get(labelPlacement) * Math.sin($.get(thisAngleSlice))
			]
		);

		$.append($$anchor, fragment);
	});

	$.reset(g);

	$.template_effect(() => {
		$.set_attribute(g, 'transform', `translate(${$width() / 2}, ${$height() / 2})`);
		$.set_attribute(circle, 'r', $.get(max));
		$.set_attribute(circle_1, 'r', $.get(max) / 2);
	});

	$.append($$anchor, g);
	$.pop();
	$$cleanup();
}