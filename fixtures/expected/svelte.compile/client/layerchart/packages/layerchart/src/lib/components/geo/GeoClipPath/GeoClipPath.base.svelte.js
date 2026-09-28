import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { geoPath as d3GeoPath } from 'd3-geo';
import { createId } from '$lib/utils/createId.js';
import { getGeoContext } from '$lib/contexts/geo.js';

export default function GeoClipPath_base($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId('clipPath-', uid)),
		disabled = $.prop($$props, 'disabled', 3, false),
		invert = $.prop($$props, 'invert', 3, false);

	const geo = getGeoContext();

	const path = $.derived(() => geo.projection && $$props.geojson
		? d3GeoPath(geo.projection)($$props.geojson) ?? undefined
		: undefined);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => $$props.ClipPath, ($$anchor, ClipPath_1) => {
		ClipPath_1($$anchor, {
			get id() {
				return id();
			},

			get disabled() {
				return disabled();
			},

			get invert() {
				return invert();
			},

			get children() {
				return $$props.children;
			},

			get path() {
				return $.get(path);
			}
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}