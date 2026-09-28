import 'svelte/internal/disclose-version';
import { getCountriesTopology } from '$lib/geo.remote';
import * as $ from 'svelte/internal/client';

import {
	geoOrthographic,
	geoAzimuthalEqualArea,
	geoCentroid,
	geoBounds,
	geoDistance
} from 'd3-geo';

import { cubicInOut } from 'svelte/easing';
import { feature } from 'topojson-client';
import { Chart, Layer, Rect } from 'layerchart';
import { GeoPath, GeoProjection, Graticule } from 'layerchart/geo';
import { SelectField } from 'svelte-ux';

const countriesTopo = await getCountriesTopology();
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="grid gap-2"><div class="grid grid-cols-[1fr_1fr_auto] gap-2 items-end screenshot-hidden"><!> <!> <!></div> <div class="grid grid-cols-[280px_1fr] gap-2"><div class="grid gap-2"><div class="border rounded-lg overflow-hidden bg-surface-100/50"><div class="text-xs font-medium px-2 pt-1 text-surface-content/60">Region A</div> <div class="h-52"><!></div></div> <div class="border rounded-lg overflow-hidden bg-surface-100/50"><div class="text-xs font-medium px-2 pt-1 text-surface-content/60">Region B</div> <div class="h-52"><!></div></div></div> <div class="border rounded-lg overflow-hidden bg-surface-100/50"><div class="text-xs font-medium px-2 pt-1 text-surface-content/60">True size comparison (Equal-Area)</div> <div role="application"><!></div></div></div></div>`);

export default function True_size_globe($$anchor, $$props) {
	$.push($$props, true);

	const countries = feature(countriesTopo, countriesTopo.objects.countries);

	// Chart contexts for tweened transforms
	let contextA = $.state(void 0);

	let contextB = $.state(void 0);
	let comparisonContext = $.state(void 0);

	// Derived rotation from each chart's transform (for comparison view + viewport rects)
	const rotateA = $.derived(() => $.get(contextA)?.transform
		? [
			$.get(contextA).transform.translate.x,
			$.get(contextA).transform.translate.y,
			0
		]
		: [-20, 0, 0]);

	const rotateB = $.derived(() => $.get(contextB)?.transform
		? [
			$.get(contextB).transform.translate.x,
			$.get(contextB).transform.translate.y,
			0
		]
		: [100, -40, 0]);

	// Comparison zoom — driven by the comparison Chart's transform scale
	const comparisonZoom = $.derived(() => $.get(comparisonContext)?.transform?.scale ?? 3);

	const zoomMin = 1.5;
	const zoomMax = 12;

	// Track comparison chart dimensions for viewport indicator rectangle
	let comparisonContainerW = $.state(432);

	let comparisonContainerH = $.state(432);

	// Compute viewport indicator rect size in pixels on a globe chart.
	// Azimuthal equal-area: pixel offset d → angular distance θ = 2*asin(d/(2*scale))
	// Orthographic: angular distance θ → pixel offset r = globeRadius * sin(θ)
	function viewportRectSize(globeRadius) {
		if (!globeRadius || !$.get(comparisonZoom)) return { w: 0, h: 0 };

		const compScale = Math.min($.get(comparisonContainerW), $.get(comparisonContainerH)) / 2 * $.get(comparisonZoom);

		// Angular half-extents visible in the comparison view
		const thetaH = 2 * Math.asin(Math.min(1, $.get(comparisonContainerH) / 2 / (2 * compScale)));

		const thetaW = 2 * Math.asin(Math.min(1, $.get(comparisonContainerW) / 2 / (2 * compScale)));

		// Map those angles to pixel distances on the orthographic globe
		return {
			w: 2 * globeRadius * Math.sin(thetaW),
			h: 2 * globeRadius * Math.sin(thetaH)
		};
	}

	// Continent center coordinates for rotation
	const continentCenters = {
		Africa: [20, 0],
		Antarctica: [0, -90],
		Asia: [100, 35],
		Europe: [15, 50],
		'North America': [-100, 40],
		'South America': [-58, -15],
		Oceania: [135, -25]
	};

	const continentOptions = Object.keys(continentCenters).sort().map((name) => ({ label: name, value: name, group: 'Continents' }));

	const countryOptionsList = countries.features.map((f) => ({
		label: f.properties?.name ?? String(f.id),
		value: f.properties?.name ?? String(f.id),
		group: 'Countries'
	})).filter((o) => o.label).sort((a, b) => a.label.localeCompare(b.label));

	const allOptions = [...continentOptions, ...countryOptionsList];
	let selectedAName = $.state(null);
	let selectedBName = $.state(null);

	function rotateToRegion(name, context) {
		if (!context?.transform) return;

		// Check continents first
		if (name in continentCenters) {
			const [lon, lat] = continentCenters[name];

			context.transform.setTranslate({ x: -lon, y: -lat });

			return;
		}

		// Otherwise look up country feature
		const feat = countries.features.find((f) => f.properties?.name === name);

		if (!feat) return;

		const [lon, lat] = geoCentroid(feat);

		context.transform.setTranslate({ x: -lon, y: -lat });
	}

	// Approximate angular radii for continents (degrees)
	const continentRadii = {
		Africa: 40,
		Antarctica: 30,
		Asia: 45,
		Europe: 25,
		'North America': 40,
		'South America': 35,
		Oceania: 25
	};

	// Compute the angular radius (in degrees) needed to encompass a region
	function angularExtent(name) {
		if (name in continentRadii) return continentRadii[name];

		const feat = countries.features.find((f) => f.properties?.name === name);

		if (!feat) return 30;

		const center = geoCentroid(feat);
		const bounds = geoBounds(feat);

		// Max angular distance from centroid to bounding box corners
		const corners = [
			[bounds[0][0], bounds[0][1]],
			[bounds[1][0], bounds[0][1]],
			[bounds[1][0], bounds[1][1]],
			[bounds[0][0], bounds[1][1]]
		];

		const maxDist = Math.max(...corners.map((c) => geoDistance(center, c)));

		return maxDist * (180 / Math.PI); // convert radians to degrees
	}

	// Compute ideal zoom for a given angular radius (degrees)
	// For azimuthal equal-area: zoom = 1 / (2 * sin(θ/2)), with buffer
	function zoomForExtent(angleDeg, buffer = 0.85) {
		const theta = angleDeg * (Math.PI / 180);

		return Math.max(zoomMin, Math.min(zoomMax, buffer / (2 * Math.sin(theta / 2))));
	}

	$.user_effect(() => {
		if ($.get(selectedAName)) {
			rotateToRegion($.get(selectedAName), $.get(contextA));

			// Clear preset if selection doesn't match
			if ($.get(selectedPreset)) {
				const preset = presets.find((p) => p.label === $.get(selectedPreset));

				if (preset && $.get(selectedAName) !== preset.a) $.set(selectedPreset, null);
			}
		}
	});

	$.user_effect(() => {
		if ($.get(selectedBName)) {
			rotateToRegion($.get(selectedBName), $.get(contextB));

			if ($.get(selectedPreset)) {
				const preset = presets.find((p) => p.label === $.get(selectedPreset));

				if (preset && $.get(selectedBName) !== preset.b) $.set(selectedPreset, null);
			}
		}
	});

	// Auto-zoom: reacts to either selection changing
	$.user_effect(() => {
		if (!$.get(selectedAName) || !$.get(selectedBName) || !$.get(comparisonContext)?.transform) return;

		const extentA = angularExtent($.get(selectedAName));
		const extentB = angularExtent($.get(selectedBName));

		$.get(comparisonContext).transform.setScale(Math.min(zoomForExtent(extentA), zoomForExtent(extentB)));
	});

	// Presets for quick comparisons (matching reference example)
	const presets = [
		{
			label: 'Africa vs North America',
			a: 'Africa',
			b: 'North America'
		},
		{ label: 'Sweden vs Madagascar', a: 'Sweden', b: 'Madagascar' },
		{
			label: 'Australia vs Antarctica',
			a: 'Australia',
			b: 'Antarctica'
		},
		{ label: 'Europe vs Brazil', a: 'Europe', b: 'Brazil' },
		{
			label: 'United States vs Australia',
			a: 'United States of America',
			b: 'Australia'
		},

		{
			label: 'South America vs Greenland',
			a: 'South America',
			b: 'Greenland'
		},

		{
			label: 'Brazil vs United States',
			a: 'Brazil',
			b: 'United States of America'
		},
		{ label: 'Africa vs Russia', a: 'Africa', b: 'Russia' },
		{
			label: 'Saudi Arabia vs Alaska',
			a: 'Saudi Arabia',
			b: 'United States of America'
		},
		{ label: 'Europe vs Antarctica', a: 'Europe', b: 'Antarctica' }
	];

	let selectedPreset = $.state(null);

	function applyPreset(preset) {
		$.set(selectedAName, preset.a, true);
		$.set(selectedBName, preset.b, true);
		$.set(selectedPreset, preset.label, true);
	}

	// Drag on comparison view rotates both globes together
	let draggingBoth = $.state(false);

	let dragStart = $.state(null);

	function startBothDrag(e) {
		$.set(draggingBoth, true);

		$.set(
			dragStart,
			{
				x: e.clientX,
				y: e.clientY,
				rA: [...$.get(rotateA)],
				rB: [...$.get(rotateB)]
			},
			true
		);

		e.currentTarget.setPointerCapture(e.pointerId);
	}

	function onBothDrag(e) {
		if (!$.get(draggingBoth) || !$.get(dragStart)) return;

		const dx = e.clientX - $.get(dragStart).x;
		const dy = e.clientY - $.get(dragStart).y;
		const sensitivity = 0.5 / $.get(comparisonZoom);

		$.get(contextA)?.transform?.setTranslate(
			{
				x: $.get(dragStart).rA[0] + dx * sensitivity,
				y: Math.max(-90, Math.min(90, $.get(dragStart).rA[1] - dy * sensitivity))
			},
			{ duration: 0 }
		);

		$.get(contextB)?.transform?.setTranslate(
			{
				x: $.get(dragStart).rB[0] + dx * sensitivity,
				y: Math.max(-90, Math.min(90, $.get(dragStart).rB[1] - dy * sensitivity))
			},
			{ duration: 0 }
		);
	}

	function endBothDrag() {
		$.set(draggingBoth, false);
		$.set(dragStart, null);
	}

	// Transform motion config shared by both globe charts
	const transformMotion = {
		mode: 'projection',
		motion: { type: 'tween', duration: 800, easing: cubicInOut },
		inertia: true
	};

	// Set initial positions once contexts are ready
	let initialized = false;

	$.user_effect(() => {
		if (!initialized && $.get(contextA)?.transform && $.get(contextB)?.transform && $.get(comparisonContext)?.transform) {
			initialized = true;
			applyPreset(presets[0]);
		}
	});

	const data = { countriesTopo, countries };
	var $$exports = { data };
	var div = root_2();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	SelectField(node, {
		label: 'Region A',
		get options() {
			return allOptions;
		},
		search: async (text, options) => options.filter((o) => o.label.toLowerCase().includes(text.toLowerCase())),
		placeholder: 'Search countries...',
		clearable: false,
		stepper: true,
		get value() {
			return $.get(selectedAName);
		},

		set value($$value) {
			$.set(selectedAName, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	SelectField(node_1, {
		label: 'Region B',
		get options() {
			return allOptions;
		},
		search: async (text, options) => options.filter((o) => o.label.toLowerCase().includes(text.toLowerCase())),
		placeholder: 'Search countries...',
		clearable: false,
		stepper: true,
		get value() {
			return $.get(selectedBName);
		},

		set value($$value) {
			$.set(selectedBName, $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	{
		let $0 = $.derived(() => presets.map((p) => ({ label: p.label, value: p.label })));

		SelectField(node_2, {
			label: 'Presets',
			get options() {
				return $.get($0);
			},
			placeholder: 'Quick compare...',
			stepper: true,
			get value() {
				return $.get(selectedPreset);
			},

			set value($$value) {
				$.set(selectedPreset, $$value, true);
			},

			$$events: {
				change: (e) => {
					const preset = presets.find((p) => p.label === e.detail.value);

					if (preset) applyPreset(preset);
				}
			}
		});
	}

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var div_3 = $.child(div_2);
	var div_4 = $.child(div_3);
	var div_5 = $.sibling($.child(div_4), 2);
	var node_3 = $.child(div_5);

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			const globeR = $.derived(() => Math.min(context().width, context().height) / 2);
			const vp = $.derived(() => viewportRectSize($.get(globeR)));
			var fragment = root_1();
			var node_4 = $.first_child(fragment);

			Layer(node_4, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_5 = $.first_child(fragment_1);

					GeoPath(node_5, {
						geojson: { type: 'Sphere' },
						class: 'fill-surface-200/50 stroke-surface-content/20'
					});

					var node_6 = $.sibling(node_5, 2);

					Graticule(node_6, { class: 'stroke-surface-content/10' });

					var node_7 = $.sibling(node_6, 2);

					$.each(node_7, 19, () => countries.features, (feat, i) => feat.id ?? i, ($$anchor, feat) => {
						GeoPath($$anchor, {
							get geojson() {
								return $.get(feat);
							},
							class: 'fill-surface-content/70 stroke-surface-100/30'
						});
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_4, 2);

			Layer(node_8, {
				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => context().width / 2 - $.get(vp).w / 2);
						let $1 = $.derived(() => context().height / 2 - $.get(vp).h / 2);

						Rect($$anchor, {
							get x() {
								return $.get($0);
							},

							get y() {
								return $.get($1);
							},

							get width() {
								return $.get(vp).w;
							},

							get height() {
								return $.get(vp).h;
							},
							class: 'fill-surface-content/10 stroke-surface-content/50',
							strokeWidth: 1.5,
							rx: 1
						});
					}
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		};

		let $0 = $.derived(() => ({ projection: geoOrthographic, fitGeojson: { type: 'Sphere' } }));

		Chart(node_3, {
			get geo() {
				return $.get($0);
			},

			get transform() {
				return transformMotion;
			},
			padding: { top: 4, bottom: 4, left: 4, right: 4 },
			get context() {
				return $.get(contextA);
			},

			set context($$value) {
				$.set(contextA, $$value, true);
			},
			children,
			$$slots: { default: true }
		});
	}

	$.reset(div_5);
	$.reset(div_4);

	var div_6 = $.sibling(div_4, 2);
	var div_7 = $.sibling($.child(div_6), 2);
	var node_9 = $.child(div_7);

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			const globeR = $.derived(() => Math.min(context().width, context().height) / 2);
			const vp = $.derived(() => viewportRectSize($.get(globeR)));
			var fragment_4 = root_1();
			var node_10 = $.first_child(fragment_4);

			Layer(node_10, {
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root();
					var node_11 = $.first_child(fragment_5);

					GeoPath(node_11, {
						geojson: { type: 'Sphere' },
						class: 'fill-surface-200/50 stroke-surface-content/20'
					});

					var node_12 = $.sibling(node_11, 2);

					Graticule(node_12, { class: 'stroke-surface-content/10' });

					var node_13 = $.sibling(node_12, 2);

					$.each(node_13, 19, () => countries.features, (feat, i) => feat.id ?? i, ($$anchor, feat) => {
						GeoPath($$anchor, {
							get geojson() {
								return $.get(feat);
							},
							class: 'fill-primary/70 stroke-primary-content/30',
							strokeWidth: 0.5
						});
					});

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			var node_14 = $.sibling(node_10, 2);

			Layer(node_14, {
				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => context().width / 2 - $.get(vp).w / 2);
						let $1 = $.derived(() => context().height / 2 - $.get(vp).h / 2);

						Rect($$anchor, {
							get x() {
								return $.get($0);
							},

							get y() {
								return $.get($1);
							},

							get width() {
								return $.get(vp).w;
							},

							get height() {
								return $.get(vp).h;
							},
							class: 'fill-primary/10 stroke-surface-content/50',
							strokeWidth: 1.5,
							rx: 1
						});
					}
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_4);
		};

		let $0 = $.derived(() => ({ projection: geoOrthographic, fitGeojson: { type: 'Sphere' } }));

		Chart(node_9, {
			get geo() {
				return $.get($0);
			},

			get transform() {
				return transformMotion;
			},
			padding: { top: 4, bottom: 4, left: 4, right: 4 },
			get context() {
				return $.get(contextB);
			},

			set context($$value) {
				$.set(contextB, $$value, true);
			},
			children,
			$$slots: { default: true }
		});
	}

	$.reset(div_7);
	$.reset(div_6);
	$.reset(div_3);

	var div_8 = $.sibling(div_3, 2);
	var div_9 = $.sibling($.child(div_8), 2);
	let classes;
	var node_15 = $.child(div_9);

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			const baseScale = $.derived(() => Math.min(context().width, context().height) / 2);
			const scale = $.derived(() => $.get(baseScale) * context().transform.scale);
			const cx = $.derived(() => context().width / 2);
			const cy = $.derived(() => context().height / 2);
			var fragment_8 = root_1();
			var node_16 = $.first_child(fragment_8);

			Layer(node_16, {
				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => ({
							yaw: $.get(rotateA)[0],
							pitch: $.get(rotateA)[1],
							roll: $.get(rotateA)[2]
						}));

						let $1 = $.derived(() => [$.get(cx), $.get(cy)]);

						GeoProjection($$anchor, {
							projection: () => geoAzimuthalEqualArea().clipAngle(150),
							get rotate() {
								return $.get($0);
							},

							get scale() {
								return $.get(scale);
							},

							get translate() {
								return $.get($1);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_10 = root_1();
								var node_17 = $.first_child(fragment_10);

								Graticule(node_17, { class: 'stroke-surface-content/5' });

								var node_18 = $.sibling(node_17, 2);

								$.each(node_18, 19, () => countries.features, (feat, i) => feat.id ?? i, ($$anchor, feat) => {
									GeoPath($$anchor, {
										get geojson() {
											return $.get(feat);
										},
										class: 'fill-surface-content/80 stroke-surface-100/30',
										strokeWidth: 0.5
									});
								});

								$.append($$anchor, fragment_10);
							},
							$$slots: { default: true }
						});
					}
				},
				$$slots: { default: true }
			});

			var node_19 = $.sibling(node_16, 2);

			Layer(node_19, {
				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => ({
							yaw: $.get(rotateB)[0],
							pitch: $.get(rotateB)[1],
							roll: $.get(rotateB)[2]
						}));

						let $1 = $.derived(() => [$.get(cx), $.get(cy)]);

						GeoProjection($$anchor, {
							projection: () => geoAzimuthalEqualArea().clipAngle(150),
							get rotate() {
								return $.get($0);
							},

							get scale() {
								return $.get(scale);
							},

							get translate() {
								return $.get($1);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_13 = $.comment();
								var node_20 = $.first_child(fragment_13);

								$.each(node_20, 19, () => countries.features, (feat, i) => feat.id ?? i, ($$anchor, feat) => {
									GeoPath($$anchor, {
										get geojson() {
											return $.get(feat);
										},
										class: 'fill-primary/50 stroke-primary-content',
										strokeWidth: 0.5
									});
								});

								$.append($$anchor, fragment_13);
							},
							$$slots: { default: true }
						});
					}
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_8);
		};

		let $0 = $.derived(() => ({
			projection: geoAzimuthalEqualArea,
			fitGeojson: { type: 'Sphere' }
		}));

		let $1 = $.derived(() => ({
			mode: 'manual',
			scrollMode: 'scale',
			initialScale: 3,
			scaleExtent: [zoomMin, zoomMax],
			motion: { type: 'tween', duration: 800, easing: cubicInOut }
		}));

		Chart(node_15, {
			get geo() {
				return $.get($0);
			},

			get transform() {
				return $.get($1);
			},
			padding: { top: 0, bottom: 0, left: 0, right: 0 },
			get context() {
				return $.get(comparisonContext);
			},

			set context($$value) {
				$.set(comparisonContext, $$value, true);
			},
			children,
			$$slots: { default: true }
		});
	}

	$.reset(div_9);
	$.reset(div_8);
	$.reset(div_2);
	$.reset(div);
	$.template_effect(() => classes = $.set_class(div_9, 1, 'h-108 cursor-grab overflow-hidden', null, classes, { 'cursor-grabbing': $.get(draggingBoth) }));
	$.delegated('pointerdown', div_9, startBothDrag);
	$.delegated('pointermove', div_9, onBothDrag);
	$.delegated('pointerup', div_9, endBothDrag);
	$.event('pointercancel', div_9, endBothDrag);
	$.bind_element_size(div_9, 'clientWidth', ($$value) => $.set(comparisonContainerW, $$value));
	$.bind_element_size(div_9, 'clientHeight', ($$value) => $.set(comparisonContainerH, $$value));
	$.append($$anchor, div);

	return $.pop($$exports);
}

$.delegate(['pointerdown', 'pointermove', 'pointerup']);