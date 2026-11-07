import * as $ from 'svelte/internal/server';
import { asAny } from '$lib/utils/types.js';
import { extractLayerProps } from '$lib/utils/attributes.js';
import { HighlightState } from './Highlight.shared.svelte.js';

export default function Highlight_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			Circle,
			Line,
			Rect,
			Arc,
			points = false,
			lines: linesProp = false,
			area = false,
			bar = false,
			opacity,
			motion = 'spring',
			onAreaClick,
			onBarClick,
			onPointClick,
			onPointEnter,
			onPointLeave,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const c = new HighlightState(() => ({
			...rest,
			points,
			lines: linesProp,
			area,
			bar,
			opacity,
			motion
		}));

		if (c.highlightData) {
			$$renderer.push('<!--[0-->');

			if (area && c.inPanel) {
				$$renderer.push('<!--[0-->');

				if (typeof area === 'function') {
					$$renderer.push('<!--[0-->');
					area($$renderer, { area: c.area });
					$$renderer.push(`<!---->`);
				} else if (c.ctx.radial) {
					$$renderer.push('<!--[1-->');

					if (Arc) {
						$$renderer.push('<!--[-->');

						Arc($$renderer, {
							motion: motion === 'spring' ? 'spring' : undefined,
							startAngle: c.area.x,
							endAngle: c.area.x + c.area.width,
							innerRadius: c.area.y,
							outerRadius: c.area.y + c.area.height,
							opacity,
							class: 'lc-highlight-area',
							onclick: onAreaClick && ((e) => onAreaClick(e, { data: c.highlightData }))
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				} else {
					$$renderer.push('<!--[-1-->');

					if (Rect) {
						$$renderer.push('<!--[-->');

						Rect($$renderer, $.spread_props([
							{ motion: motion === 'spring' ? 'spring' : undefined, opacity },
							c.area,
							extractLayerProps(area, 'lc-highlight-area'),
							{
								onclick: onAreaClick && ((e) => onAreaClick(e, { data: c.highlightData }))
							}
						]));

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (bar && c.inPanel) {
				$$renderer.push('<!--[0-->');

				if (typeof bar === 'function') {
					$$renderer.push('<!--[0-->');
					bar($$renderer);
					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push('<!--[-1-->');

					$.await($$renderer, import('../Bar/Bar.svelte'), () => {}, ({ default: Bar }) => {
						if (Bar) {
							$$renderer.push('<!--[-->');

							Bar($$renderer, $.spread_props([
								{
									motion: motion === 'spring' ? 'spring' : undefined,
									data: c.highlightData,
									opacity
								},
								extractLayerProps(bar, 'lc-highlight-bar'),
								{
									onclick: onBarClick && ((e) => onBarClick(e, { data: c.highlightData }))
								}
							]));

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					});

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (linesProp) {
				$$renderer.push('<!--[0-->');

				if (typeof linesProp === 'function') {
					$$renderer.push('<!--[0-->');
					linesProp($$renderer, { lines: c.lines });
					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push(`<!--[-1--><!--[-->`);

					const each_array = $.ensure_array_like(c.lines);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let line = each_array[$$index];

						if (Line) {
							$$renderer.push('<!--[-->');

							Line($$renderer, $.spread_props([
								{
									motion: motion === 'spring' ? 'spring' : undefined,
									x1: line.x1,
									y1: line.y1,
									x2: line.x2,
									y2: line.y2,
									dashArray: [2, 2],
									opacity
								},
								extractLayerProps(linesProp, 'lc-highlight-line')
							]));

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (points) {
				$$renderer.push('<!--[0-->');

				if (typeof points === 'function') {
					$$renderer.push('<!--[0-->');
					points($$renderer, { points: c.points });
					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push(`<!--[-1--><!--[-->`);

					const each_array_1 = $.ensure_array_like(c.points);

					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
						let point = each_array_1[$$index_1];

						const pointOpacity = opacity ?? (point.seriesKey
							? c.ctx.series.isHighlighted(point.seriesKey, true) ? 1 : 0.1
							: undefined);

						if (Circle) {
							$$renderer.push('<!--[-->');

							Circle($$renderer, $.spread_props([
								{
									motion: motion === 'spring' ? 'spring' : undefined,
									cx: point.x,
									cy: point.y,
									fill: point.fill,
									r: point.r ?? 4,
									strokeWidth: point.r ? 2 : 6,
									opacity: pointOpacity
								},
								extractLayerProps(points, 'lc-highlight-point'),
								{
									onpointerdown: onPointClick && ((e) => {
										e.stopPropagation();
									}),
									onclick: onPointClick && ((e) => onPointClick(e, { point, data: c.highlightData })),
									onpointerenter: (e) => {
										if (onPointClick) {
											asAny(e.target).style.cursor = 'pointer';
										}

										if (point.seriesKey) {
											c.ctx.series.highlightKey = point.seriesKey;
										}

										onPointEnter?.(e, { point, data: c.highlightData });
									},

									onpointerleave: (e) => {
										if (onPointClick) {
											asAny(e.target).style.cursor = 'default';
										}

										if (point.seriesKey) {
											c.ctx.series.highlightKey = null;
										}

										onPointLeave?.(e, { point, data: c.highlightData });
									}
								}
							]));

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}