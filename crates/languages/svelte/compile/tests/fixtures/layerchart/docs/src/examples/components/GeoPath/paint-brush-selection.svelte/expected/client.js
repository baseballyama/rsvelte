import 'svelte/internal/disclose-version';
import { getUsCountiesAlbersTopology } from '$lib/geo.remote.js';
import * as $ from 'svelte/internal/client';
import { geoIdentity, geoPath as d3GeoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import { SvelteMap } from 'svelte/reactivity';
import { localPoint } from '@layerstack/utils';
import { Chart, Circle, Layer, Path, Rect } from 'layerchart';
import { GeoPath } from 'layerchart/geo';
import { Button, Field, ToggleGroup, ToggleOption } from 'svelte-ux';
import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';
import LucidePencil from '~icons/lucide/pencil';
import LucideSquare from '~icons/lucide/square';
import LucideCircle from '~icons/lucide/circle';
import LucideLasso from '~icons/lucide/lasso';
import LucideEraser from '~icons/lucide/eraser';
import LucideMinus from '~icons/lucide/minus';
import LucidePlus from '~icons/lucide/plus';
import LucideCrosshair from '~icons/lucide/crosshair';
import LucidePaintbrush from '~icons/lucide/paintbrush';

const geojson = await getUsCountiesAlbersTopology();
var root = $.from_html(`<button></button>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> Pencil`, 1);
var root_4 = $.from_html(`<!> Box`, 1);
var root_5 = $.from_html(`<!> Circle`, 1);
var root_6 = $.from_html(`<!> Lasso`, 1);
var root_7 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_8 = $.from_html(`<div><!> <span class="text-sm tabular-nums w-8 text-center"> </span> <!> <span class="text-xs text-surface-content/50 ml-1">[ / ]</span></div>`);
var root_9 = $.from_html(`<!> Contact`, 1);
var root_10 = $.from_html(`<!> Centroid`, 1);
var root_11 = $.from_html(`<div class="grid gap-2"><div class="flex items-start gap-2"><div class="flex flex-col items-center gap-1 screenshot-hidden pt-1"><!> <button aria-label="Eraser"><!></button></div> <div class="flex-1"><!></div></div> <div class="flex items-center justify-center gap-4 flex-wrap mt-6 screenshot-hidden"><!> <!> <!> <!></div></div>`);

export default function Paint_brush_selection($$anchor, $$props) {
	$.push($$props, true);

	// Tailwind 500-tier: evenly spaced across the color wheel, harmonious as a set
	const palette = [
		'#ef4444', // red-500
		'#f97316', // orange-500
		'#eab308', // yellow-500
		'#84cc16', // lime-500
		'#10b981', // emerald-500
		'#06b6d4', // cyan-500
		'#3b82f6', // blue-500
		'#8b5cf6', // violet-500
		'#ec4899', // pink-500
		'#64748b' // slate-500
	];

	const states = feature(geojson, geojson.objects.states);
	const counties = feature(geojson, geojson.objects.counties);
	const projection = geoIdentity;

	// Chart context for accessing fitted projection
	let chartContext = $.state(void 0);

	// Per-county hit data: projected bbox, centroid, and polygon vertices,
	// computed once the chart's fitted projection is available.
	// x0, y0, x1, y1
	const countyHits = $.derived(() => {
		const proj = $.get(chartContext)?.geo.projection;

		if (!proj) return new Map();

		const pg = d3GeoPath(proj);
		const map = new Map();

		for (const f of counties.features) {
			const bounds = pg.bounds(f);
			const centroid = pg.centroid(f);

			if (!bounds || !isFinite(bounds[0][0]) || !isFinite(bounds[1][0])) continue;
			if (!centroid || !isFinite(centroid[0]) || !isFinite(centroid[1])) continue;

			const points = [];
			const geom = f.geometry;

			const processRing = (ring) => {
				for (const coord of ring) {
					const p = proj(coord);

					if (p && isFinite(p[0]) && isFinite(p[1])) points.push([p[0], p[1]]);
				}
			};

			if (geom.type === 'Polygon') {
				for (const ring of geom.coordinates) processRing(ring);
			} else if (geom.type === 'MultiPolygon') {
				for (const poly of geom.coordinates) for (const ring of poly) processRing(ring);
			}

			map.set(f.id, {
				bbox: [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]],
				centroid,
				points
			});
		}

		return map;
	});

	let mode = $.state('pencil');
	let hitMode = $.state('contact');
	let selectedColor = $.state($.proxy(palette[0]));
	let paintedCounties = new SvelteMap();

	// Brush size for box/circle modes
	let brushSize = $.state(40);

	const BRUSH_SIZE_MIN = 10;
	const BRUSH_SIZE_MAX = 200;
	const BRUSH_SIZE_STEP = 10;

	// Interaction state
	let painting = $.state(false);

	let pointerPos = $.state(null);

	// Lasso-specific state
	let lassoPoints = $.state($.proxy([]));

	// Chart container ref for localPoint coordinate conversion
	let chartEl = $.state(void 0);

	let lassoPath = $.derived(() => {
		if ($.get(mode) !== 'lasso' || $.get(lassoPoints).length < 2) return '';

		return 'M' + $.get(lassoPoints).map((p) => `${p.x},${p.y}`).join('L') + 'Z';
	});

	// Ray-casting point-in-polygon test
	function pointInPolygon(px, py, polygon) {
		let inside = false;

		for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
			const xi = polygon[i].x, yi = polygon[i].y;
			const xj = polygon[j].x, yj = polygon[j].y;
			const intersect = yi > py !== yj > py && px < (xj - xi) * (py - yi) / (yj - yi) + xi;

			if (intersect) inside = !inside;
		}

		return inside;
	}

	function getLocalPoint(e) {
		const point = localPoint(e, $.get(chartEl));

		if (!point) return null;

		// Convert screen space → chart space by inverting the transform.
		// In canvas mode, the transform is applied to rendering while the
		// projection (and our pre-computed county hit data) stay fixed.
		const t = $.get(chartContext)?.transform;

		if (!t) return { x: point.x, y: point.y };

		return {
			x: (point.x - t.translate.x) / t.scale,
			y: (point.y - t.translate.y) / t.scale
		};
	}

	function paintCounty(id) {
		if ($.get(selectedColor) === null) {
			paintedCounties.delete(id);
		} else {
			paintedCounties.set(id, $.get(selectedColor));
		}
	}

	// Paint counties under the brush at a given position.
	// `centroid` mode: paint only if the county centroid falls inside the brush.
	// `contact` mode: paint if any part of the county touches the brush —
	// bbox pre-filter (fast), then test if any polygon vertex is inside the
	// brush, or the brush center falls inside the county bbox (catches small
	// counties fully enclosed by the brush with no sampled vertex hit).
	function paintBrushAt(pos) {
		// brushSize is in screen pixels; convert to chart space
		const scale = $.get(chartContext)?.transform.scale ?? 1;

		const half = $.get(brushSize) / 2 / scale;
		const r2 = half * half;

		const bx0 = pos.x - half,
			by0 = pos.y - half,
			bx1 = pos.x + half,
			by1 = pos.y + half;

		for (const [id, hit] of $.get(countyHits)) {
			const [x0, y0, x1, y1] = hit.bbox;

			// Fast reject: county bbox doesn't overlap brush bbox
			if (x1 < bx0 || x0 > bx1 || y1 < by0 || y0 > by1) continue;

			let touched = false;

			if ($.get(hitMode) === 'centroid') {
				const [cx, cy] = hit.centroid;

				if ($.get(mode) === 'box') {
					touched = cx >= bx0 && cx <= bx1 && cy >= by0 && cy <= by1;
				} else if ($.get(mode) === 'circle') {
					const dx = cx - pos.x;
					const dy = cy - pos.y;

					touched = dx * dx + dy * dy <= r2;
				}
			} else {
				// contact mode
				if ($.get(mode) === 'box') {
					for (const [px, py] of hit.points) {
						if (px >= bx0 && px <= bx1 && py >= by0 && py <= by1) {
							touched = true;

							break;
						}
					}

					if (!touched && pos.x >= x0 && pos.x <= x1 && pos.y >= y0 && pos.y <= y1) {
						touched = true;
					}
				} else if ($.get(mode) === 'circle') {
					for (const [px, py] of hit.points) {
						const dx = px - pos.x;
						const dy = py - pos.y;

						if (dx * dx + dy * dy <= r2) {
							touched = true;

							break;
						}
					}

					if (!touched && pos.x >= x0 && pos.x <= x1 && pos.y >= y0 && pos.y <= y1) {
						touched = true;
					}
				}
			}

			if (touched) paintCounty(id);
		}
	}

	// Paint counties inside the lasso polygon.
	// `centroid` mode: centroid must be inside the lasso.
	// `contact` mode: any polygon vertex inside the lasso (or lasso covers the county).
	function paintLassoSelection() {
		if ($.get(lassoPoints).length < 3) return;

		// Lasso bbox
		let lx0 = Infinity,
			ly0 = Infinity,
			lx1 = -Infinity,
			ly1 = -Infinity;

		for (const p of $.get(lassoPoints)) {
			if (p.x < lx0) lx0 = p.x;
			if (p.y < ly0) ly0 = p.y;
			if (p.x > lx1) lx1 = p.x;
			if (p.y > ly1) ly1 = p.y;
		}

		for (const [id, hit] of $.get(countyHits)) {
			const [x0, y0, x1, y1] = hit.bbox;

			if (x1 < lx0 || x0 > lx1 || y1 < ly0 || y0 > ly1) continue;

			let touched = false;

			if ($.get(hitMode) === 'centroid') {
				const [cx, cy] = hit.centroid;

				touched = pointInPolygon(cx, cy, $.get(lassoPoints));
			} else {
				for (const [px, py] of hit.points) {
					if (pointInPolygon(px, py, $.get(lassoPoints))) {
						touched = true;

						break;
					}
				}

				if (!touched) {
					const ccx = (x0 + x1) / 2;
					const ccy = (y0 + y1) / 2;

					if (pointInPolygon(ccx, ccy, $.get(lassoPoints))) touched = true;
				}
			}

			if (touched) paintCounty(id);
		}
	}

	function handleCountyClick(e, countyFeature) {
		if ($.get(mode) !== 'pencil') return;

		paintCounty(countyFeature.id);
	}

	function handleCountyPointerEnter(countyFeature) {
		if ($.get(mode) === 'pencil' && $.get(painting)) {
			paintCounty(countyFeature.id);
		}
	}

	function handlePointerDown(e) {
		const point = getLocalPoint(e);

		if (!point) return;

		$.set(painting, true);
		$.set(pointerPos, point, true);

		if ($.get(mode) === 'pencil') {
			// Pencil mode: painting handled by GeoPath events
			return;
		}

		if ($.get(mode) === 'lasso') {
			$.set(lassoPoints, [point], true);
		} else {
			// Box/circle brush: paint immediately at pointer position
			paintBrushAt(point);
		}

		e.currentTarget.setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e) {
		const point = getLocalPoint(e);

		if (!point) return;

		$.set(pointerPos, point, true);

		if (!$.get(painting)) return;

		if ($.get(mode) === 'lasso') {
			$.set(lassoPoints, [...$.get(lassoPoints), point], true);
		} else if ($.get(mode) === 'box' || $.get(mode) === 'circle') {
			paintBrushAt(point);
		}
	}

	function handlePointerUp() {
		if ($.get(mode) === 'lasso' && $.get(painting)) {
			paintLassoSelection();
			$.set(lassoPoints, [], true);
		}

		$.set(painting, false);
	}

	function handlePointerLeave() {
		$.set(pointerPos, null);
	}

	function adjustBrushSize(delta) {
		$.set(brushSize, Math.max(BRUSH_SIZE_MIN, Math.min(BRUSH_SIZE_MAX, $.get(brushSize) + delta)), true);
	}

	function handleKeyDown(e) {
		if (e.key === '[') {
			e.preventDefault();
			adjustBrushSize(-BRUSH_SIZE_STEP);
		} else if (e.key === ']') {
			e.preventDefault();
			adjustBrushSize(BRUSH_SIZE_STEP);
		}
	}

	function clearAll() {
		paintedCounties.clear();
	}

	const isBrushMode = $.derived(() => $.get(mode) === 'box' || $.get(mode) === 'circle');
	const data = { geojson, states, counties };
	var $$exports = { data };
	var div = root_11();

	$.event('keydown', $.window, handleKeyDown);

	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	$.each(node, 16, () => palette, (color) => color, ($$anchor, color) => {
		var button = root();
		let classes;
		let styles;

		$.template_effect(() => {
			classes = $.set_class(button, 1, 'h-6 w-6 rounded-sm border-2 transition-transform', null, classes, {
				'scale-110': $.get(selectedColor) === color,
				'border-surface-content': $.get(selectedColor) === color,
				'border-transparent': $.get(selectedColor) !== color
			});

			$.set_attribute(button, 'aria-label', `Select color ${color ?? ''}`);
			styles = $.set_style(button, '', styles, { 'background-color': color });
		});

		$.delegated('click', button, () => $.set(selectedColor, color, true));
		$.append($$anchor, button);
	});

	var button_1 = $.sibling(node, 2);
	let classes_1;
	var node_1 = $.child(button_1);

	LucideEraser(node_1, { class: 'h-4 w-4' });
	$.reset(button_1);
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	let styles_1;
	var node_2 = $.child(div_3);

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			const strokeScale = $.derived(() => 1 / context().transform.scale);
			var fragment = root_2();
			var node_3 = $.first_child(fragment);

			TransformContextControls(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			Layer(node_4, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_1();
					var node_5 = $.first_child(fragment_1);

					$.each(node_5, 17, () => counties.features, (countyFeature) => countyFeature.id, ($$anchor, countyFeature) => {
						{
							let $0 = $.derived(() => paintedCounties.get($.get(countyFeature).id) ?? '#e5e7eb');
							let $1 = $.derived(() => 0.5 * $.get(strokeScale));

							GeoPath($$anchor, {
								get geojson() {
									return $.get(countyFeature);
								},

								get fill() {
									return $.get($0);
								},
								class: 'stroke-surface-100/50 hover:brightness-90',
								get strokeWidth() {
									return $.get($1);
								},
								onclick: (e) => handleCountyClick(e, $.get(countyFeature)),
								onpointerenter: () => handleCountyPointerEnter($.get(countyFeature))
							});
						}
					});

					var node_6 = $.sibling(node_5, 2);

					{
						let $0 = $.derived(() => 1 * $.get(strokeScale));

						GeoPath(node_6, {
							get geojson() {
								return states;
							},
							class: 'fill-none stroke-surface-content/30 pointer-events-none',
							get strokeWidth() {
								return $.get($0);
							}
						});
					}

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_4, 2);

			Layer(node_7, {
				pointerEvents: false,
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_2();
					var node_8 = $.first_child(fragment_3);

					{
						var consequent = ($$anchor) => {
							{
								let $0 = $.derived(() => $.get(pointerPos).x - $.get(brushSize) / 2 / context().transform.scale);
								let $1 = $.derived(() => $.get(pointerPos).y - $.get(brushSize) / 2 / context().transform.scale);
								let $2 = $.derived(() => $.get(brushSize) / context().transform.scale);
								let $3 = $.derived(() => $.get(brushSize) / context().transform.scale);
								let $4 = $.derived(() => $.get(selectedColor) ?? 'rgba(0,0,0,0.1)');
								let $5 = $.derived(() => $.get(selectedColor) ?? '#666');
								let $6 = $.derived(() => 1 * $.get(strokeScale));

								Rect($$anchor, {
									get x() {
										return $.get($0);
									},

									get y() {
										return $.get($1);
									},

									get width() {
										return $.get($2);
									},

									get height() {
										return $.get($3);
									},

									get fill() {
										return $.get($4);
									},
									fillOpacity: 0.25,
									get stroke() {
										return $.get($5);
									},

									get strokeWidth() {
										return $.get($6);
									},
									class: 'pointer-events-none'
								});
							}
						};

						$.if(node_8, ($$render) => {
							if ($.get(pointerPos) && $.get(mode) === 'box') $$render(consequent);
						});
					}

					var node_9 = $.sibling(node_8, 2);

					{
						var consequent_1 = ($$anchor) => {
							{
								let $0 = $.derived(() => $.get(brushSize) / 2 / context().transform.scale);
								let $1 = $.derived(() => $.get(selectedColor) ?? 'rgba(0,0,0,0.1)');
								let $2 = $.derived(() => $.get(selectedColor) ?? '#666');
								let $3 = $.derived(() => 1 * $.get(strokeScale));

								Circle($$anchor, {
									get cx() {
										return $.get(pointerPos).x;
									},

									get cy() {
										return $.get(pointerPos).y;
									},

									get r() {
										return $.get($0);
									},

									get fill() {
										return $.get($1);
									},
									fillOpacity: 0.25,
									get stroke() {
										return $.get($2);
									},

									get strokeWidth() {
										return $.get($3);
									},
									class: 'pointer-events-none'
								});
							}
						};

						$.if(node_9, ($$render) => {
							if ($.get(pointerPos) && $.get(mode) === 'circle') $$render(consequent_1);
						});
					}

					var node_10 = $.sibling(node_9, 2);

					{
						var consequent_2 = ($$anchor) => {
							{
								let $0 = $.derived(() => $.get(selectedColor) ?? 'rgba(0,0,0,0.1)');
								let $1 = $.derived(() => $.get(selectedColor) ?? '#666');
								let $2 = $.derived(() => 1.5 * $.get(strokeScale));

								Path($$anchor, {
									get pathData() {
										return $.get(lassoPath);
									},

									get fill() {
										return $.get($0);
									},
									fillOpacity: 0.2,
									get stroke() {
										return $.get($1);
									},

									get strokeWidth() {
										return $.get($2);
									},
									class: 'pointer-events-none'
								});
							}
						};

						$.if(node_10, ($$render) => {
							if ($.get(painting) && $.get(mode) === 'lasso' && $.get(lassoPath)) $$render(consequent_2);
						});
					}

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		};

		let $0 = $.derived(() => ({ projection, fitGeojson: states }));

		Chart(node_2, {
			get geo() {
				return $.get($0);
			},

			transform: {
				mode: 'canvas',
				scrollMode: 'translate',
				scaleExtent: [1, 8],
				disablePointer: true
			},
			height: 600,
			clip: true,
			get ref() {
				return $.get(chartEl);
			},

			set ref($$value) {
				$.set(chartEl, $$value, true);
			},

			get context() {
				return $.get(chartContext);
			},

			set context($$value) {
				$.set(chartContext, $$value, true);
			},
			children,
			$$slots: { default: true }
		});
	}

	$.reset(div_3);
	$.reset(div_1);

	var div_4 = $.sibling(div_1, 2);
	var node_11 = $.child(div_4);

	Field(node_11, {
		label: 'Tool',
		dense: true,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const id = $.derived(() => $$slotProps.id);

				ToggleGroup($$anchor, {
					variant: 'outline',
					size: 'sm',
					get id() {
						return $.get(id);
					},

					get value() {
						return $.get(mode);
					},

					set value($$value) {
						$.set(mode, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_8 = root_7();
						var node_12 = $.first_child(fragment_8);

						ToggleOption(node_12, {
							value: 'pencil',
							classes: { option: 'flex flex-col items-center gap-0.5 pb-1.5' },
							children: ($$anchor, $$slotProps) => {
								var fragment_9 = root_3();
								var node_13 = $.first_child(fragment_9);

								LucidePencil(node_13, { class: 'h-4 w-4' });
								$.next();
								$.append($$anchor, fragment_9);
							},
							$$slots: { default: true }
						});

						var node_14 = $.sibling(node_12, 2);

						ToggleOption(node_14, {
							value: 'box',
							classes: { option: 'flex flex-col items-center gap-0.5 pb-1.5' },
							children: ($$anchor, $$slotProps) => {
								var fragment_10 = root_4();
								var node_15 = $.first_child(fragment_10);

								LucideSquare(node_15, { class: 'h-4 w-4' });
								$.next();
								$.append($$anchor, fragment_10);
							},
							$$slots: { default: true }
						});

						var node_16 = $.sibling(node_14, 2);

						ToggleOption(node_16, {
							value: 'circle',
							classes: { option: 'flex flex-col items-center gap-0.5 pb-1.5' },
							children: ($$anchor, $$slotProps) => {
								var fragment_11 = root_5();
								var node_17 = $.first_child(fragment_11);

								LucideCircle(node_17, { class: 'h-4 w-4' });
								$.next();
								$.append($$anchor, fragment_11);
							},
							$$slots: { default: true }
						});

						var node_18 = $.sibling(node_16, 2);

						ToggleOption(node_18, {
							value: 'lasso',
							classes: { option: 'flex flex-col items-center gap-0.5 pb-1.5' },
							children: ($$anchor, $$slotProps) => {
								var fragment_12 = root_6();
								var node_19 = $.first_child(fragment_12);

								LucideLasso(node_19, { class: 'h-4 w-4' });
								$.next();
								$.append($$anchor, fragment_12);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_8);
					},
					$$slots: { default: true }
				});
			}
		}
	});

	var node_20 = $.sibling(node_11, 2);

	Field(node_20, {
		label: 'Size',
		dense: true,
		children: ($$anchor, $$slotProps) => {
			var div_5 = root_8();
			let classes_2;
			var node_21 = $.child(div_5);

			{
				let $0 = $.derived(() => !$.get(isBrushMode) || $.get(brushSize) <= BRUSH_SIZE_MIN);

				Button(node_21, {
					variant: 'outline',
					size: 'sm',
					onclick: () => adjustBrushSize(-BRUSH_SIZE_STEP),
					get disabled() {
						return $.get($0);
					},
					'aria-label': 'Decrease brush size',
					children: ($$anchor, $$slotProps) => {
						LucideMinus($$anchor, { class: 'h-4 w-4' });
					},
					$$slots: { default: true }
				});
			}

			var span = $.sibling(node_21, 2);
			var text = $.only_child(span, true);
			var node_22 = $.sibling(span, 2);

			{
				let $0 = $.derived(() => !$.get(isBrushMode) || $.get(brushSize) >= BRUSH_SIZE_MAX);

				Button(node_22, {
					variant: 'outline',
					size: 'sm',
					onclick: () => adjustBrushSize(BRUSH_SIZE_STEP),
					get disabled() {
						return $.get($0);
					},
					'aria-label': 'Increase brush size',
					children: ($$anchor, $$slotProps) => {
						LucidePlus($$anchor, { class: 'h-4 w-4' });
					},
					$$slots: { default: true }
				});
			}

			$.next(2);
			$.reset(div_5);

			$.template_effect(() => {
				classes_2 = $.set_class(div_5, 1, 'flex items-center gap-1 transition-opacity', null, classes_2, {
					'opacity-40': !$.get(isBrushMode),
					'pointer-events-none': !$.get(isBrushMode)
				});

				$.set_attribute(div_5, 'aria-disabled', !$.get(isBrushMode));
				$.set_text(text, $.get(brushSize));
			});

			$.append($$anchor, div_5);
		},
		$$slots: { default: true }
	});

	var node_23 = $.sibling(node_20, 2);

	Field(node_23, {
		label: 'Hit',
		dense: true,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const id = $.derived(() => $$slotProps.id);

				{
					let $0 = $.derived(() => ({
						root: $.get(mode) === 'pencil'
							? 'opacity-40 pointer-events-none transition-opacity'
							: 'transition-opacity'
					}));

					ToggleGroup($$anchor, {
						variant: 'outline',
						size: 'sm',
						get id() {
							return $.get(id);
						},

						get classes() {
							return $.get($0);
						},

						get value() {
							return $.get(hitMode);
						},

						set value($$value) {
							$.set(hitMode, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_16 = root_1();
							var node_24 = $.first_child(fragment_16);

							ToggleOption(node_24, {
								value: 'contact',
								classes: { option: 'flex flex-col items-center gap-0.5 pb-1.5' },
								children: ($$anchor, $$slotProps) => {
									var fragment_17 = root_9();
									var node_25 = $.first_child(fragment_17);

									LucidePaintbrush(node_25, { class: 'h-4 w-4' });
									$.next();
									$.append($$anchor, fragment_17);
								},
								$$slots: { default: true }
							});

							var node_26 = $.sibling(node_24, 2);

							ToggleOption(node_26, {
								value: 'centroid',
								classes: { option: 'flex flex-col items-center gap-0.5 pb-1.5' },
								children: ($$anchor, $$slotProps) => {
									var fragment_18 = root_10();
									var node_27 = $.first_child(fragment_18);

									LucideCrosshair(node_27, { class: 'h-4 w-4' });
									$.next();
									$.append($$anchor, fragment_18);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_16);
						},
						$$slots: { default: true }
					});
				}
			}
		}
	});

	var node_28 = $.sibling(node_23, 2);

	Button(node_28, {
		variant: 'outline',
		size: 'sm',
		onclick: clearAll,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Clear All');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_4);
	$.reset(div);

	$.template_effect(() => {
		classes_1 = $.set_class(button_1, 1, 'h-6 w-6 rounded-sm border-2 transition-transform flex items-center justify-center bg-surface-100', null, classes_1, {
			'scale-110': $.get(selectedColor) === null,
			'border-surface-content': $.get(selectedColor) === null,
			'border-transparent': $.get(selectedColor) !== null
		});

		styles_1 = $.set_style(div_3, '', styles_1, { cursor: $.get(mode) !== 'pencil' ? 'crosshair' : undefined });
	});

	$.delegated('click', button_1, () => $.set(selectedColor, null));
	$.delegated('pointerdown', div_3, handlePointerDown);
	$.delegated('pointermove', div_3, handlePointerMove);
	$.delegated('pointerup', div_3, handlePointerUp);
	$.event('pointercancel', div_3, handlePointerUp);
	$.event('pointerleave', div_3, handlePointerLeave);
	$.append($$anchor, div);

	return $.pop($$exports);
}

$.delegate(['click', 'pointerdown', 'pointermove', 'pointerup']);