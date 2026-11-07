import * as $ from 'svelte/internal/server';
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
import { getUsCountiesAlbersTopology } from '$lib/geo.remote.js';

const geojson = await getUsCountiesAlbersTopology();

export default function Paint_brush_selection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
		let chartContext = void 0;

		// Per-county hit data: projected bbox, centroid, and polygon vertices,
		// computed once the chart's fitted projection is available.
		// x0, y0, x1, y1
		const countyHits = $.derived(() => {
			const proj = chartContext?.geo.projection;

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

		let mode = 'pencil';
		let hitMode = 'contact';
		let selectedColor = palette[0];
		let paintedCounties = new SvelteMap();

		// Brush size for box/circle modes
		let brushSize = 40;

		const BRUSH_SIZE_MIN = 10;
		const BRUSH_SIZE_MAX = 200;
		const BRUSH_SIZE_STEP = 10;

		// Interaction state
		let painting = false;

		let pointerPos = null;

		// Lasso-specific state
		let lassoPoints = [];

		// Chart container ref for localPoint coordinate conversion
		let chartEl = void 0;

		let lassoPath = $.derived(() => {
			if (mode !== 'lasso' || lassoPoints.length < 2) return '';

			return 'M' + lassoPoints.map((p) => `${p.x},${p.y}`).join('L') + 'Z';
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
			const point = localPoint(e, chartEl);

			if (!point) return null;

			// Convert screen space → chart space by inverting the transform.
			// In canvas mode, the transform is applied to rendering while the
			// projection (and our pre-computed county hit data) stay fixed.
			const t = chartContext?.transform;

			if (!t) return { x: point.x, y: point.y };

			return {
				x: (point.x - t.translate.x) / t.scale,
				y: (point.y - t.translate.y) / t.scale
			};
		}

		function paintCounty(id) {
			if (selectedColor === null) {
				paintedCounties.delete(id);
			} else {
				paintedCounties.set(id, selectedColor);
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
			const scale = chartContext?.transform.scale ?? 1;

			const half = brushSize / 2 / scale;
			const r2 = half * half;

			const bx0 = pos.x - half,
				by0 = pos.y - half,
				bx1 = pos.x + half,
				by1 = pos.y + half;

			for (const [id, hit] of countyHits()) {
				const [x0, y0, x1, y1] = hit.bbox;

				// Fast reject: county bbox doesn't overlap brush bbox
				if (x1 < bx0 || x0 > bx1 || y1 < by0 || y0 > by1) continue;

				let touched = false;

				if (hitMode === 'centroid') {
					const [cx, cy] = hit.centroid;

					if (mode === 'box') {
						touched = cx >= bx0 && cx <= bx1 && cy >= by0 && cy <= by1;
					} else if (mode === 'circle') {
						const dx = cx - pos.x;
						const dy = cy - pos.y;

						touched = dx * dx + dy * dy <= r2;
					}
				} else {
					// contact mode
					if (mode === 'box') {
						for (const [px, py] of hit.points) {
							if (px >= bx0 && px <= bx1 && py >= by0 && py <= by1) {
								touched = true;

								break;
							}
						}

						if (!touched && pos.x >= x0 && pos.x <= x1 && pos.y >= y0 && pos.y <= y1) {
							touched = true;
						}
					} else if (mode === 'circle') {
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
			if (lassoPoints.length < 3) return;

			// Lasso bbox
			let lx0 = Infinity,
				ly0 = Infinity,
				lx1 = -Infinity,
				ly1 = -Infinity;

			for (const p of lassoPoints) {
				if (p.x < lx0) lx0 = p.x;
				if (p.y < ly0) ly0 = p.y;
				if (p.x > lx1) lx1 = p.x;
				if (p.y > ly1) ly1 = p.y;
			}

			for (const [id, hit] of countyHits()) {
				const [x0, y0, x1, y1] = hit.bbox;

				if (x1 < lx0 || x0 > lx1 || y1 < ly0 || y0 > ly1) continue;

				let touched = false;

				if (hitMode === 'centroid') {
					const [cx, cy] = hit.centroid;

					touched = pointInPolygon(cx, cy, lassoPoints);
				} else {
					for (const [px, py] of hit.points) {
						if (pointInPolygon(px, py, lassoPoints)) {
							touched = true;

							break;
						}
					}

					if (!touched) {
						const ccx = (x0 + x1) / 2;
						const ccy = (y0 + y1) / 2;

						if (pointInPolygon(ccx, ccy, lassoPoints)) touched = true;
					}
				}

				if (touched) paintCounty(id);
			}
		}

		function handleCountyClick(e, countyFeature) {
			if (mode !== 'pencil') return;

			paintCounty(countyFeature.id);
		}

		function handleCountyPointerEnter(countyFeature) {
			if (mode === 'pencil' && painting) {
				paintCounty(countyFeature.id);
			}
		}

		function handlePointerDown(e) {
			const point = getLocalPoint(e);

			if (!point) return;

			painting = true;
			pointerPos = point;

			if (mode === 'pencil') {
				// Pencil mode: painting handled by GeoPath events
				return;
			}

			if (mode === 'lasso') {
				lassoPoints = [point];
			} else {
				// Box/circle brush: paint immediately at pointer position
				paintBrushAt(point);
			}

			e.currentTarget.setPointerCapture(e.pointerId);
		}

		function handlePointerMove(e) {
			const point = getLocalPoint(e);

			if (!point) return;

			pointerPos = point;

			if (!painting) return;

			if (mode === 'lasso') {
				lassoPoints = [...lassoPoints, point];
			} else if (mode === 'box' || mode === 'circle') {
				paintBrushAt(point);
			}
		}

		function handlePointerUp() {
			if (mode === 'lasso' && painting) {
				paintLassoSelection();
				lassoPoints = [];
			}

			painting = false;
		}

		function handlePointerLeave() {
			pointerPos = null;
		}

		function adjustBrushSize(delta) {
			brushSize = Math.max(BRUSH_SIZE_MIN, Math.min(BRUSH_SIZE_MAX, brushSize + delta));
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

		const isBrushMode = $.derived(() => mode === 'box' || mode === 'circle');
		const data = { geojson, states, counties };
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid gap-2"><div class="flex items-start gap-2"><div class="flex flex-col items-center gap-1 screenshot-hidden pt-1"><!--[-->`);

			const each_array = $.ensure_array_like(palette);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let color = each_array[$$index];

				$$renderer.push(`<button${$.attr_class('h-6 w-6 rounded-sm border-2 transition-transform', void 0, {
					'scale-110': selectedColor === color,
					'border-surface-content': selectedColor === color,
					'border-transparent': selectedColor !== color
				})}${$.attr('aria-label', `Select color ${$.stringify(color)}`)}${$.attr_style('', { 'background-color': color })}></button>`);
			}

			$$renderer.push(`<!--]--> <button${$.attr_class('h-6 w-6 rounded-sm border-2 transition-transform flex items-center justify-center bg-surface-100', void 0, {
				'scale-110': selectedColor === null,
				'border-surface-content': selectedColor === null,
				'border-transparent': selectedColor !== null
			})} aria-label="Eraser">`);

			LucideEraser($$renderer, { class: 'h-4 w-4' });
			$$renderer.push(`<!----></button></div> <div class="flex-1"${$.attr_style('', { cursor: mode !== 'pencil' ? 'crosshair' : undefined })}>`);

			{
				function children($$renderer, { context }) {
					const strokeScale = 1 / context.transform.scale;

					TransformContextControls($$renderer, {});
					$$renderer.push(`<!----> `);

					Layer($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array_1 = $.ensure_array_like(counties.features);

							for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
								let countyFeature = each_array_1[$$index_1];

								GeoPath($$renderer, {
									geojson: countyFeature,
									fill: paintedCounties.get(countyFeature.id) ?? '#e5e7eb',
									class: 'stroke-surface-100/50 hover:brightness-90',
									strokeWidth: 0.5 * strokeScale,
									onclick: (e) => handleCountyClick(e, countyFeature),
									onpointerenter: () => handleCountyPointerEnter(countyFeature)
								});
							}

							$$renderer.push(`<!--]--> `);

							GeoPath($$renderer, {
								geojson: states,
								class: 'fill-none stroke-surface-content/30 pointer-events-none',
								strokeWidth: 1 * strokeScale
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Layer($$renderer, {
						pointerEvents: false,
						children: ($$renderer) => {
							if (pointerPos && mode === 'box') {
								$$renderer.push('<!--[0-->');

								Rect($$renderer, {
									x: pointerPos.x - brushSize / 2 / context.transform.scale,
									y: pointerPos.y - brushSize / 2 / context.transform.scale,
									width: brushSize / context.transform.scale,
									height: brushSize / context.transform.scale,
									fill: selectedColor ?? 'rgba(0,0,0,0.1)',
									fillOpacity: 0.25,
									stroke: selectedColor ?? '#666',
									strokeWidth: 1 * strokeScale,
									class: 'pointer-events-none'
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (pointerPos && mode === 'circle') {
								$$renderer.push('<!--[0-->');

								Circle($$renderer, {
									cx: pointerPos.x,
									cy: pointerPos.y,
									r: brushSize / 2 / context.transform.scale,
									fill: selectedColor ?? 'rgba(0,0,0,0.1)',
									fillOpacity: 0.25,
									stroke: selectedColor ?? '#666',
									strokeWidth: 1 * strokeScale,
									class: 'pointer-events-none'
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (painting && mode === 'lasso' && lassoPath()) {
								$$renderer.push('<!--[0-->');

								Path($$renderer, {
									pathData: lassoPath(),
									fill: selectedColor ?? 'rgba(0,0,0,0.1)',
									fillOpacity: 0.2,
									stroke: selectedColor ?? '#666',
									strokeWidth: 1.5 * strokeScale,
									class: 'pointer-events-none'
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				}

				Chart($$renderer, {
					geo: { projection, fitGeojson: states },
					transform: {
						mode: 'canvas',
						scrollMode: 'translate',
						scaleExtent: [1, 8],
						disablePointer: true
					},
					height: 600,
					clip: true,
					get ref() {
						return chartEl;
					},

					set ref($$value) {
						chartEl = $$value;
						$$settled = false;
					},

					get context() {
						return chartContext;
					},

					set context($$value) {
						chartContext = $$value;
						$$settled = false;
					},
					children,
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!----></div></div> <div class="flex items-center justify-center gap-4 flex-wrap mt-6 screenshot-hidden">`);

			Field($$renderer, {
				label: 'Tool',
				dense: true,
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { id }) => {
						ToggleGroup($$renderer, {
							variant: 'outline',
							size: 'sm',
							id,
							get value() {
								return mode;
							},

							set value($$value) {
								mode = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								ToggleOption($$renderer, {
									value: 'pencil',
									classes: { option: 'flex flex-col items-center gap-0.5 pb-1.5' },
									children: ($$renderer) => {
										LucidePencil($$renderer, { class: 'h-4 w-4' });
										$$renderer.push(`<!----> Pencil`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								ToggleOption($$renderer, {
									value: 'box',
									classes: { option: 'flex flex-col items-center gap-0.5 pb-1.5' },
									children: ($$renderer) => {
										LucideSquare($$renderer, { class: 'h-4 w-4' });
										$$renderer.push(`<!----> Box`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								ToggleOption($$renderer, {
									value: 'circle',
									classes: { option: 'flex flex-col items-center gap-0.5 pb-1.5' },
									children: ($$renderer) => {
										LucideCircle($$renderer, { class: 'h-4 w-4' });
										$$renderer.push(`<!----> Circle`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								ToggleOption($$renderer, {
									value: 'lasso',
									classes: { option: 'flex flex-col items-center gap-0.5 pb-1.5' },
									children: ($$renderer) => {
										LucideLasso($$renderer, { class: 'h-4 w-4' });
										$$renderer.push(`<!----> Lasso`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					}
				}
			});

			$$renderer.push(`<!----> `);

			Field($$renderer, {
				label: 'Size',
				dense: true,
				children: ($$renderer) => {
					$$renderer.push(`<div${$.attr_class('flex items-center gap-1 transition-opacity', void 0, {
						'opacity-40': !isBrushMode(),
						'pointer-events-none': !isBrushMode()
					})}${$.attr('aria-disabled', !isBrushMode())}>`);

					Button($$renderer, {
						variant: 'outline',
						size: 'sm',
						onclick: () => adjustBrushSize(-BRUSH_SIZE_STEP),
						disabled: !isBrushMode() || brushSize <= BRUSH_SIZE_MIN,
						'aria-label': 'Decrease brush size',
						children: ($$renderer) => {
							LucideMinus($$renderer, { class: 'h-4 w-4' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <span class="text-sm tabular-nums w-8 text-center">${$.escape(brushSize)}</span> `);

					Button($$renderer, {
						variant: 'outline',
						size: 'sm',
						onclick: () => adjustBrushSize(BRUSH_SIZE_STEP),
						disabled: !isBrushMode() || brushSize >= BRUSH_SIZE_MAX,
						'aria-label': 'Increase brush size',
						children: ($$renderer) => {
							LucidePlus($$renderer, { class: 'h-4 w-4' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <span class="text-xs text-surface-content/50 ml-1">[ / ]</span></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Field($$renderer, {
				label: 'Hit',
				dense: true,
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { id }) => {
						ToggleGroup($$renderer, {
							variant: 'outline',
							size: 'sm',
							id,
							classes: {
								root: mode === 'pencil'
									? 'opacity-40 pointer-events-none transition-opacity'
									: 'transition-opacity'
							},

							get value() {
								return hitMode;
							},

							set value($$value) {
								hitMode = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								ToggleOption($$renderer, {
									value: 'contact',
									classes: { option: 'flex flex-col items-center gap-0.5 pb-1.5' },
									children: ($$renderer) => {
										LucidePaintbrush($$renderer, { class: 'h-4 w-4' });
										$$renderer.push(`<!----> Contact`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								ToggleOption($$renderer, {
									value: 'centroid',
									classes: { option: 'flex flex-col items-center gap-0.5 pb-1.5' },
									children: ($$renderer) => {
										LucideCrosshair($$renderer, { class: 'h-4 w-4' });
										$$renderer.push(`<!----> Centroid`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					}
				}
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'outline',
				size: 'sm',
				onclick: clearAll,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Clear All`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { data });
	});
}