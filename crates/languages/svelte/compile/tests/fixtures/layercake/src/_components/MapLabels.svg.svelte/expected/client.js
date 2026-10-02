import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';

var root = $.from_svg(`<text class="map-label svelte-12osx8a"> </text>`);
var root_1 = $.from_svg(`<g class="map-labels svelte-12osx8a"></g>`);

export default function MapLabels_svg($$anchor, $$props) {
	$.push($$props, true);

	const $width = () => $.store_get(width, '$width', $$stores);
	const $height = () => $.store_get(height, '$height', $$stores);
	const $data = () => $.store_get(data, '$data', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { data, width, height } = getContext('LayerCake');

	/**
	 * @typedef {Object} Props
	 * @property {Function} projection - A D3 projection function. Pass this in as an uncalled function, e.g. `projection={geoAlbersUsa}`.
	 * @property {Function} getLabel - An accessor function to get the field to display.
	 * @property {number|undefined} [fixedAspectRatio] - By default, the map fills to fit the $width and $height. If instead you want a fixed-aspect ratio, like for a server-side rendered map, set that here.
	 * @property {Function} getCoordinates - An accessor function to get the `[x, y]` coordinate field. Defaults to a GeoJSON feature format.
	 * @property {Array<Object>|undefined} [features] - A list of labels as GeoJSON features. If unset, the plotted features will default to those in `$data.features`, assuming this field is a list of GeoJSON features.
	 */
	/** @type {Props} */
	let fitSizeRange = $.derived(() => $$props.fixedAspectRatio
		? [100, 100 / $$props.fixedAspectRatio]
		: [$width(), $height()]);

	let projectionFn = $.derived(() => $$props.projection().fitSize($.get(fitSizeRange), $data()));
	var g = root_1();

	$.each(g, 5, () => $$props.features || $data().features, $.index, ($$anchor, d) => {
		const coords = $.derived(() => $.get(projectionFn)($$props.getCoordinates($.get(d))));
		var text = root();
		var text_1 = $.only_child(text, true);

		$.template_effect(
			($0) => {
				$.set_attribute(text, 'x', $.get(coords)[0]);
				$.set_attribute(text, 'y', $.get(coords)[1]);
				$.set_text(text_1, $0);
			},
			[() => $$props.getLabel($.get(d))]
		);

		$.append($$anchor, text);
	});

	$.reset(g);
	$.append($$anchor, g);
	$.pop();
	$$cleanup();
}