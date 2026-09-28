import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';

var root = $.from_html(`<div class="map-label svelte-12yrd1l"> </div>`);
var root_1 = $.from_html(`<div class="map-labels svelte-12yrd1l"></div>`);

export default function MapLabels_html($$anchor, $$props) {
	$.push($$props, true);

	const $width = () => $.store_get(width, '$width', $$stores);
	const $height = () => $.store_get(height, '$height', $$stores);
	const $data = () => $.store_get(data, '$data', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { data, width, height } = getContext('LayerCake');

	/**
	 * @typedef {Object} Props
	 * @property {Function} projection - A D3 projection function. Pass this in as an uncalled function, e.g. `projection={geoAlbersUsa}`.
	 * @property {number|undefined} [fixedAspectRatio] - By default, the map fills to fit the $width and $height. If instead you want a fixed-aspect ratio, like for a server-side rendered map, set that here.
	 * @property {Function} getLabel - An accessor function to get the field to display.
	 * @property {Function} getCoordinates - An accessor function to get the `[x, y]` coordinate field. Defaults to a GeoJSON feature format.
	 * @property {Array<Object>|undefined} [features] - A list of labels as GeoJSON features. If unset, the plotted features will default to those in `$data.features`, assuming this field is a list of GeoJSON features.
	 */
	/** @type {Props} */
	let fitSizeRange = $.derived(() => $$props.fixedAspectRatio
		? [100, 100 / $$props.fixedAspectRatio]
		: [$width(), $height()]);

	let projectionFn = $.derived(() => $$props.projection().fitSize($.get(fitSizeRange), $data()));
	let units = $.derived(() => $$props.fixedAspectRatio ? '%' : 'px');
	var div = root_1();
	let styles;

	$.each(div, 5, () => $$props.features || $data().features, $.index, ($$anchor, d) => {
		const coords = $.derived(() => $.get(projectionFn)($$props.getCoordinates($.get(d))));
		var div_1 = root();
		var text = $.only_child(div_1, true);

		$.template_effect(
			($0) => {
				$.set_style(div_1, `
			left: ${$.get(coords)[0] ?? ''}${$.get(units) ?? ''};
			top: ${$.get(coords)[1] ?? ''}${$.get(units) ?? ''};
		`);

				$.set_text(text, $0);
			},
			[() => $$props.getLabel($.get(d))]
		);

		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.template_effect(() => styles = $.set_style(div, '', styles, { 'aspect-ratio': $$props.fixedAspectRatio ? 1 : null }));
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}