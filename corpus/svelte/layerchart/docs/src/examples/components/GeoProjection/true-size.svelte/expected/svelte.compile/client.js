import 'svelte/internal/disclose-version';
import { getCountriesTopology, getUsStatesTopology } from '$lib/geo.remote';
import * as $ from 'svelte/internal/client';

import {
	geoEqualEarth,
	geoEquirectangular,
	geoMercator,
	geoNaturalEarth1,
	geoOrthographic,
	geoCentroid
} from 'd3-geo';

import { feature } from 'topojson-client';
import { interpolateTurbo } from 'd3-scale-chromatic';
import { Chart, Layer } from 'layerchart';
import { GeoPath, Graticule } from 'layerchart/geo';
import { Button, SelectField } from 'svelte-ux';

const countriesTopo = await getCountriesTopology();
const statesTopo = await getUsStatesTopology();
var root = $.from_html(`<div class="flex items-center gap-1 border rounded-lg px-2 py-1"><span class="w-3 h-3 rounded-full inline-block shrink-0"></span> <span class="text-sm whitespace-nowrap"> </span> <input type="range" class="w-20 h-4 accent-current"/> <span class="text-xs text-surface-content/50 w-8 text-right"> </span> <button class="text-surface-content/40 hover:text-surface-content ml-1">×</button></div>`);
var root_1 = $.from_html(`<div class="flex gap-2 flex-wrap items-center screenshot-hidden"></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="grid gap-2"><div class="grid grid-cols-3 gap-2 screenshot-hidden"><!> <!> <!></div> <!> <div class="h-150 bg-surface-100/50 border rounded-lg overflow-hidden"><!></div></div>`);

export default function True_size($$anchor, $$props) {
	$.push($$props, true);

	const countries = feature(countriesTopo, countriesTopo.objects.countries);
	const usStates = feature(statesTopo, statesTopo.objects.states);

	const projections = [
		{ label: 'Mercator', value: geoMercator },
		{ label: 'Orthographic', value: geoOrthographic },
		{ label: 'Equal Earth', value: geoEqualEarth },
		{ label: 'Natural Earth', value: geoNaturalEarth1 },
		{ label: 'Equirectangular', value: geoEquirectangular }
	];

	const goldenRatio = 0.618033988749895;
	let hueOffset = $.state(0);

	function nextColor() {
		const color = interpolateTurbo(($.get(hueOffset) + 0.1) % 1);

		$.set(hueOffset, ($.get(hueOffset) + goldenRatio) % 1);

		return color;
	}

	let projection = $.state($.proxy(geoMercator));
	let selectedShapes = $.proxy([]);
	const countryOptions = $.derived(() => countries.features.map((f) => ({ label: f.properties?.name ?? String(f.id), value: f })).filter((o) => o.label).sort((a, b) => a.label.localeCompare(b.label)));
	const stateOptions = $.derived(() => usStates.features.map((f) => ({ label: f.properties?.name ?? String(f.id), value: f })).filter((o) => o.label).sort((a, b) => a.label.localeCompare(b.label)));
	let selectedCountry = $.state(null);
	let selectedState = $.state(null);

	$.user_effect(() => {
		if ($.get(selectedCountry)) {
			addShape($.get(selectedCountry));
			$.set(selectedCountry, null);
		}
	});

	$.user_effect(() => {
		if ($.get(selectedState)) {
			addShape($.get(selectedState));
			$.set(selectedState, null);
		}
	});

	function addShape(feat) {
		const color = nextColor();

		selectedShapes.push({ feature: feat, offset: [0, 0], rotation: 0, color });
	}

	function removeShape(index) {
		selectedShapes.splice(index, 1);
	}

	// --- Coordinate transformation (translate + rotate) ---
	function transformCoords(coords, dLon, dLat, angleDeg, centerLon, centerLat) {
		if (typeof coords[0] === 'number') {
			let [lon, lat] = coords;

			// Rotate around centroid first, then translate
			if (angleDeg !== 0) {
				const rad = angleDeg * Math.PI / 180;
				const cos = Math.cos(rad);
				const sin = Math.sin(rad);
				const dx = lon - centerLon;
				const dy = lat - centerLat;

				lon = centerLon + dx * cos - dy * sin;
				lat = centerLat + dx * sin + dy * cos;
			}

			return [lon + dLon, lat + dLat];
		}

		return coords.map((c) => transformCoords(c, dLon, dLat, angleDeg, centerLon, centerLat));
	}

	function transformGeometry(geometry, dLon, dLat, angleDeg, centerLon, centerLat) {
		if (geometry.type === 'GeometryCollection') {
			return {
				...geometry,
				geometries: geometry.geometries.map((g) => transformGeometry(g, dLon, dLat, angleDeg, centerLon, centerLat))
			};
		}

		return {
			...geometry,
			coordinates: transformCoords(geometry.coordinates, dLon, dLat, angleDeg, centerLon, centerLat)
		};
	}

	function transformFeature(feat, dLon, dLat, angleDeg) {
		const [centerLon, centerLat] = geoCentroid(feat);

		return {
			...feat,
			geometry: transformGeometry(feat.geometry, dLon, dLat, angleDeg, centerLon, centerLat)
		};
	}

	// --- Drag handling ---
	let dragIndex = $.state(null);

	let dragStartLonLat = $.state(null);
	let dragStartOffset = $.state(null);

	function svgPoint(e) {
		const el = e.target;
		const pt = new DOMPoint(e.clientX, e.clientY);
		const svgPt = pt.matrixTransform(el.getScreenCTM().inverse());

		return [svgPt.x, svgPt.y];
	}

	function startDrag(e, index, proj) {
		e.stopPropagation();
		$.set(dragIndex, index, true);

		const coords = svgPoint(e);
		const lonLat = proj?.invert?.(coords);

		if (lonLat) {
			$.set(dragStartLonLat, lonLat, true);
			$.set(dragStartOffset, [...selectedShapes[index].offset], true);
		}

		e.target.setPointerCapture(e.pointerId);
	}

	function onDrag(e, proj) {
		if ($.get(dragIndex) === null || !$.get(dragStartLonLat) || !$.get(dragStartOffset)) return;

		const coords = svgPoint(e);
		const lonLat = proj?.invert?.(coords);

		if (lonLat) {
			selectedShapes[$.get(dragIndex)].offset = [
				$.get(dragStartOffset)[0] + (lonLat[0] - $.get(dragStartLonLat)[0]),
				$.get(dragStartOffset)[1] + (lonLat[1] - $.get(dragStartLonLat)[1])
			];
		}
	}

	function endDrag() {
		$.set(dragIndex, null);
		$.set(dragStartLonLat, null);
		$.set(dragStartOffset, null);
	}

	const data = { countriesTopo, statesTopo, countries, usStates };
	var $$exports = { data };
	var div = root_3();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	SelectField(node, {
		label: 'Projection',
		get options() {
			return projections;
		},
		clearable: false,
		get value() {
			return $.get(projection);
		},

		set value($$value) {
			$.set(projection, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	SelectField(node_1, {
		label: 'Add country',
		get options() {
			return $.get(countryOptions);
		},
		search: async (text, options) => options.filter((o) => o.label.toLowerCase().includes(text.toLowerCase())),
		clearable: true,
		placeholder: 'Search countries...',
		get value() {
			return $.get(selectedCountry);
		},

		set value($$value) {
			$.set(selectedCountry, $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	SelectField(node_2, {
		label: 'Add US state',
		get options() {
			return $.get(stateOptions);
		},
		search: async (text, options) => options.filter((o) => o.label.toLowerCase().includes(text.toLowerCase())),
		clearable: true,
		placeholder: 'Search states...',
		get value() {
			return $.get(selectedState);
		},

		set value($$value) {
			$.set(selectedState, $$value, true);
		}
	});

	$.reset(div_1);

	var node_3 = $.sibling(div_1, 2);

	{
		var consequent = ($$anchor) => {
			var div_2 = root_1();

			$.each(div_2, 21, () => selectedShapes, $.index, ($$anchor, shape, i) => {
				var div_3 = root();
				var span = $.child(div_3);
				let styles;
				var span_1 = $.sibling(span, 2);
				var text_1 = $.only_child(span_1, true);
				var input = $.sibling(span_1, 2);

				$.remove_input_defaults(input);
				$.set_attribute(input, 'min', -180);
				$.set_attribute(input, 'max', 180);
				$.set_attribute(input, 'step', 1);

				let styles_1;
				var span_2 = $.sibling(input, 2);
				var text_2 = $.only_child(span_2);
				var button = $.sibling(span_2, 2);

				$.reset(div_3);

				$.template_effect(() => {
					styles = $.set_style(span, '', styles, { background: $.get(shape).color });
					$.set_text(text_1, $.get(shape).feature.properties?.name ?? 'Unknown');
					$.set_attribute(input, 'title', `Rotate: ${$.get(shape).rotation ?? ''}°`);
					styles_1 = $.set_style(input, '', styles_1, { color: $.get(shape).color });
					$.set_text(text_2, `${$.get(shape).rotation ?? ''}°`);
				});

				$.bind_value(input, () => $.get(shape).rotation, ($$value) => ($.get(shape).rotation = $$value));
				$.delegated('click', button, () => removeShape(i));
				$.append($$anchor, div_3);
			});

			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		$.if(node_3, ($$render) => {
			if (selectedShapes.length) $$render(consequent);
		});
	}

	var div_4 = $.sibling(node_3, 2);
	var node_4 = $.child(div_4);

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment = root_2();
			var node_5 = $.first_child(fragment);

			Layer(node_5, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_2();
					var node_6 = $.first_child(fragment_1);

					Graticule(node_6, { class: 'stroke-surface-content/10' });

					var node_7 = $.sibling(node_6, 2);

					$.each(node_7, 17, () => countries.features, $.index, ($$anchor, feature, $$index_1, $$array) => {
						GeoPath($$anchor, {
							get geojson() {
								return $.get(feature);
							},
							class: 'stroke-surface-content/20 fill-surface-200'
						});
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_5, 2);

			Layer(node_8, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = $.comment();
					var node_9 = $.first_child(fragment_3);

					$.each(node_9, 17, () => selectedShapes, $.index, ($$anchor, shape, i) => {
						const translated = $.derived(() => transformFeature($.get(shape).feature, $.get(shape).offset[0], $.get(shape).offset[1], $.get(shape).rotation));

						{
							let $0 = $.derived(() => 2 / context().transform.scale);
							let $1 = $.derived(() => $.get(dragIndex) === i ? 'cursor-grabbing' : 'cursor-grab');

							GeoPath($$anchor, {
								get geojson() {
									return $.get(translated);
								},

								get fill() {
									return $.get(shape).color;
								},
								'fill-opacity': 0.5,
								get stroke() {
									return $.get(shape).color;
								},

								get strokeWidth() {
									return $.get($0);
								},

								get class() {
									return $.get($1);
								},
								onpointerdown: (e) => startDrag(e, i, context().geo.projection),
								onpointermove: (e) => onDrag(e, context().geo.projection),
								onpointerup: () => endDrag(),
								onpointercancel: () => endDrag()
							});
						}
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		};

		let $0 = $.derived(() => ({ projection: $.get(projection), fitGeojson: countries }));

		Chart(node_4, {
			get geo() {
				return $.get($0);
			},

			transform: {
				mode: 'projection',
				scrollMode: 'scale',
				scaleExtent: [0.5, 10],
				translateExtent: [[-300, -200], [300, 200]]
			},
			padding: { top: 8, bottom: 8, left: 8, right: 8 },
			children,
			$$slots: { default: true }
		});
	}

	$.reset(div_4);
	$.reset(div);
	$.append($$anchor, div);

	return $.pop($$exports);
}

$.delegate(['click']);