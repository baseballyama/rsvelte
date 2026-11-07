import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { geoPath } from 'd3-geo';
import { raise } from 'layercake';

var root = $.from_svg(`<path class="feature-path svelte-ibsccr" role="tooltip"></path>`);
var root_1 = $.from_svg(`<g class="map-group" role="tooltip"></g>`);

export default function Map_svg($$anchor, $$props) {
	$.push($$props, true);

	const $width = () => $.store_get(width, '$width', $$stores);
	const $height = () => $.store_get(height, '$height', $$stores);
	const $data = () => $.store_get(data, '$data', $$stores);
	const $zGet = () => $.store_get(zGet, '$zGet', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { data, width, height, zGet } = getContext('LayerCake');

	/**
	 * @typedef {Object} Props
	 * @property {Function} projection - A D3 projection function. Pass this in as an uncalled function, e.g. `projection={geoAlbersUsa}`.
	 * @property {number|undefined} [fixedAspectRatio] - By default, the map fills to fit the $width and $height. If instead you want a fixed-aspect ratio, like for a server-side rendered map, set that here.
	 * @property {string|undefined} [fill] - The shape's fill color. By default, the fill will be determined by the z-scale, unless this prop is set.
	 * @property {string} [stroke='#333'] - The shape's stroke color.
	 * @property {number} [strokeWidth=0.5] - The shape's stroke width.
	 * @property {Array<Object>|undefined} [features] - A list of GeoJSON features. Use this if you want to draw a subset of the features in `$data` while keeping the zoom on the whole GeoJSON feature set. By default, it plots everything in `$data.features` if left unset.
	 * @property {(e: MouseEvent, props: Object) => void} [onmousemove] - A function that gets called on mousemove events. The first argument is the event, and the second is the properties of the hovered feature.
	 * @property {(e: MouseEvent) => void} [onmouseout] - A function that gets called on mouseout events.
	 */
	/** @type {Props} */
	let stroke = $.prop($$props, 'stroke', 3, '#333'),
		strokeWidth = $.prop($$props, 'strokeWidth', 3, 0.5),
		onmousemove = $.prop($$props, 'onmousemove', 3, () => {}),
		onmouseout = $.prop($$props, 'onmouseout', 3, () => {});

	/* --------------------------------------------
	 * Here's how you would do cross-component hovers
	 */
	let fitSizeRange = $.derived(() => $$props.fixedAspectRatio
		? [100, 100 / $$props.fixedAspectRatio]
		: [$width(), $height()]);

	let projectionFn = $.derived(() => $$props.projection().fitSize($.get(fitSizeRange), $data()));
	let geoPathFn = $.derived(() => geoPath($.get(projectionFn)));

	function handleMousemove(feature) {
		return function handleMousemoveFn(e) {
			// @ts-ignore
			raise(this);

			// When the element gets raised, it flashes 0,0 for a second so skip that
			if (e.layerX !== 0 && e.layerY !== 0) {
				onmousemove()(e, feature.properties);
			}
		};
	}

	var g = root_1();

	$.each(g, 5, () => $$props.features || $data().features, $.index, ($$anchor, feature) => {
		var path = root();
		var event_handler = $.derived(() => handleMousemove($.get(feature)));

		$.template_effect(
			($0, $1) => {
				$.set_attribute(path, 'fill', $0);
				$.set_attribute(path, 'stroke', stroke());
				$.set_attribute(path, 'stroke-width', strokeWidth());
				$.set_attribute(path, 'd', $1);
			},
			[
				() => $$props.fill || $zGet()($.get(feature).properties),
				() => $.get(geoPathFn)($.get(feature))
			]
		);

		$.delegated('mouseover', path, (e) => onmousemove()(e, $.get(feature).properties));

		$.delegated('mousemove', path, function (...$$args) {
			$.get(event_handler)?.apply(this, $$args);
		});

		$.append($$anchor, path);
	});

	$.reset(g);

	$.delegated('mouseout', g, function (...$$args) {
		onmouseout()?.apply(this, $$args);
	});

	$.append($$anchor, g);
	$.pop();
	$$cleanup();
}

$.delegate(['mouseout', 'mouseover', 'mousemove']);