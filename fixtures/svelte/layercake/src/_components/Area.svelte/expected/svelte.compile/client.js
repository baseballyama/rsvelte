import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';

var root = $.from_svg(`<path class="path-area"></path>`);

export default function Area($$anchor, $$props) {
	$.push($$props, true);

	const $data = () => $.store_get(data, '$data', $$stores);
	const $xGet = () => $.store_get(xGet, '$xGet', $$stores);
	const $yGet = () => $.store_get(yGet, '$yGet', $$stores);
	const $yScale = () => $.store_get(yScale, '$yScale', $$stores);
	const $xScale = () => $.store_get(xScale, '$xScale', $$stores);
	const $extents = () => $.store_get(extents, '$extents', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { data, xGet, yGet, xScale, yScale, extents } = getContext('LayerCake');

	/**
	 * @typedef {Object} Props
	 * @property {string} [fill='#ab00d610'] - The shape's fill color. This is technically optional because it comes with a default value but you'll likely want to replace it with your own color.
	 */
	/** @type {Props} */
	let fill = $.prop($$props, 'fill', 3, '#ab00d610');

	let path = $.derived(() => 'M' + $data().map((/** @type {object} */ d) => {
		return $xGet()(d) + ',' + $yGet()(d);
	}).join('L'));

	/**	@type {string} **/
	let area = $.derived(() => {
		const yRange = $yScale().range();

		return $.get(path) + ('L' + $xScale()($extents().x ? $extents().x[1] : 0) + ',' + yRange[0] + 'L' + $xScale()($extents().x ? $extents().x[0] : 0) + ',' + yRange[0] + 'Z');
	});

	var path_1 = root();

	$.template_effect(() => {
		$.set_attribute(path_1, 'd', $.get(area));
		$.set_attribute(path_1, 'fill', fill());
	});

	$.append($$anchor, path_1);
	$.pop();
	$$cleanup();
}