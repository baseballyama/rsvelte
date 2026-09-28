import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { extractLayerProps } from '$lib/utils/attributes.js';
import { PointsState } from './Points.shared.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Circle',
	'data',
	'x',
	'y',
	'seriesKey',
	'r',
	'offsetX',
	'offsetY',
	'fill',
	'fillOpacity',
	'stroke',
	'strokeWidth',
	'opacity',
	'children'
]);

export default function Points_base($$anchor, $$props) {
	$.push($$props, true);

	let r = $.prop($$props, 'r', 3, 5),
		restProps = $.rest_props($$props, rest_excludes);

	const c = new PointsState(() => ({
		data: $$props.data,
		x: $$props.x,
		y: $$props.y,
		seriesKey: $$props.seriesKey,
		r: r(),
		offsetX: $$props.offsetX,
		offsetY: $$props.offsetY,
		fill: $$props.fill,
		fillOpacity: $$props.fillOpacity,
		stroke: $$props.stroke,
		strokeWidth: $$props.strokeWidth,
		opacity: $$props.opacity
	}));

	/**
	 * Faded when something else is highlighted — the row's `c` category when the legend names
	 * those, and the point's series otherwise.  A single series names nothing to tell apart, so it
	 * never fades on its own account.
	 */
	function highlightOpacity(d) {
		const category = c.ctx.cKey(d);

		if (category != null) {
			return c.ctx.series.isHighlighted(category, true) ? 1 : 0.1;
		}

		return c.series?.key == null || c.ctx.series.visibleSeries.length <= 1 || c.ctx.series.isHighlighted(c.series.key, true) ? 1 : 0.1;
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.children, () => ({ points: c.points }));
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			$.each(node_2, 17, () => c.points, $.index, ($$anchor, point) => {
				var fragment_3 = $.comment();
				var node_3 = $.first_child(fragment_3);

				{
					let $0 = $.derived(() => $$props.fill ?? c.series?.color ?? (c.ctx.config.c ? c.ctx.cGet($.get(point).data) : null));
					let $1 = $.derived(() => $$props.opacity ?? highlightOpacity($.get(point).data));
					let $2 = $.derived(() => extractLayerProps(restProps, 'lc-point'));

					$.component(node_3, () => $$props.Circle, ($$anchor, Circle_1) => {
						Circle_1($$anchor, $.spread_props(
							{
								get cx() {
									return $.get(point).x;
								},

								get cy() {
									return $.get(point).y;
								},

								get r() {
									return $.get(point).r;
								},

								get fill() {
									return $.get($0);
								},

								get fillOpacity() {
									return $$props.fillOpacity;
								},

								get stroke() {
									return $$props.stroke;
								},

								get strokeWidth() {
									return $$props.strokeWidth;
								},

								get opacity() {
									return $.get($1);
								}
							},
							() => c.series?.props,
							() => $.get($2)
						));
					});
				}

				$.append($$anchor, fragment_3);
			});

			$.append($$anchor, fragment_2);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}