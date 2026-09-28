import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { uniques } from 'layercake';
import { Delaunay } from 'd3-delaunay';

var root = $.from_svg(`<path class="voronoi-cell svelte-eilwqv" role="tooltip"></path>`);

export default function Voronoi($$anchor, $$props) {
	$.push($$props, true);

	const $data = () => $.store_get(data, '$data', $$stores);
	const $xGet = () => $.store_get(xGet, '$xGet', $$stores);
	const $yGet = () => $.store_get(yGet, '$yGet', $$stores);
	const $width = () => $.store_get(width, '$width', $$stores);
	const $height = () => $.store_get(height, '$height', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { data, xGet, yGet, width, height } = getContext('LayerCake');

	/** @typedef {[number, number] & { data?: any }} Point */
	/**
	 * @typedef {Object} Props
	 * @property {string|undefined} [stroke] - An optional stroke color, which is likely only useful for testing to make sure the shapes drew correctly.
	 * @property {(event: MouseEvent, point: Array<number>) => void} [onmouseover] - A function that gets called on mouseover events. The first argument is the event, and the second is the point data.
	 */
	/** @type {Props} */
	let onmouseover = $.prop($$props, 'onmouseover', 3, () => {});

	/**
	 * @param {MouseEvent} e
	 * @param {Point} point
	 */
	function log(e, point) {
		console.log(point, point.data);
		onmouseover()(e, point);
	}

	/** @type {Point[]} */
	let points = $.derived(() => $data().map((d) => {
		/** @type {Point} */
		const point = [$xGet()(d), $yGet()(d)];

		point.data = d;

		return point;
	}));

	let uniquePoints = $.derived(() => uniques($.get(points), (d) => d.join(), false) ?? []);
	let voronoi = $.derived(() => Delaunay.from($.get(uniquePoints) ?? []).voronoi([0, 0, $width(), $height()]));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => $.get(uniquePoints), $.index, ($$anchor, point, i) => {
		var path = root();

		$.template_effect(
			($0) => {
				$.set_style(path, `stroke: ${$$props.stroke ?? ''}`);
				$.set_attribute(path, 'd', $0);
			},
			[() => $.get(voronoi).renderCell(i)]
		);

		$.delegated('mouseover', path, (e) => log(e, $.get(point)));
		$.append($$anchor, path);
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['mouseover']);