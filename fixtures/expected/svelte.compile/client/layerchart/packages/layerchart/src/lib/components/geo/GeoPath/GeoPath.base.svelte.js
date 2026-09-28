import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { geoPath as d3GeoPath, geoTransform as d3geoTransform } from 'd3-geo';
import { curveLinearClosed } from 'd3-shape';
import { cls } from '@layerstack/tailwind';
import { geoCurvePath } from '$lib/utils/geo.js';
import { getChartContext } from '$lib/contexts/chart.js';
import { getGeoContext } from '$lib/contexts/geo.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Path',
	'geoTransform',
	'geojson',
	'tooltip',
	'curve',
	'onclick',
	'onpointerenter',
	'onpointermove',
	'onpointerleave',
	'class',
	'ref',
	'children'
]);

export default function GeoPath_base($$anchor, $$props) {
	$.push($$props, true);

	let curve = $.prop($$props, 'curve', 3, curveLinearClosed),
		restProps = $.rest_props($$props, rest_excludes);

	const ctx = getChartContext();
	const geo = getGeoContext();

	const projection = $.derived(() => $$props.geoTransform && geo.projection
		? d3geoTransform($$props.geoTransform(geo.projection))
		: geo.projection);

	const geoPath = $.derived(() => {
		$$props.geojson;

		if (!$.get(projection)) return;

		if (curve() === curveLinearClosed) {
			return d3GeoPath($.get(projection));
		}

		return geoCurvePath($.get(projection), curve());
	});

	const pathData = $.derived(() => $$props.geojson ? $.get(geoPath)?.($$props.geojson) ?? '' : '');

	function _onClick(e) {
		$$props.onclick?.(e, $.get(geoPath));
	}

	function _onPointerEnter(e) {
		$$props.onpointerenter?.(e);

		if ($$props.tooltip) {
			ctx?.tooltip.show(e, $$props.geojson);
		}
	}

	function _onPointerMove(e) {
		$$props.onpointermove?.(e);

		if ($$props.tooltip) {
			ctx.tooltip.show(e, $$props.geojson);
		}
	}

	function _onPointerLeave(e) {
		$$props.onpointerleave?.(e);

		if ($$props.tooltip) {
			ctx.tooltip.hide();
		}
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.children, () => ({ geoPath: $.get(geoPath) }));
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			{
				let $0 = $.derived(() => cls('lc-geo-path', $$props.class));

				$.component(node_2, () => $$props.Path, ($$anchor, Path_1) => {
					Path_1($$anchor, $.spread_props(
						{
							get pathData() {
								return $.get(pathData);
							}
						},
						() => restProps,
						() => $$props.onclick && { onclick: _onClick },
						() => ($$props.tooltip || $$props.onpointerenter) && { onpointerenter: _onPointerEnter },
						() => ($$props.tooltip || $$props.onpointermove) && { onpointermove: _onPointerMove },
						() => ($$props.tooltip || $$props.onpointerleave) && { onpointerleave: _onPointerLeave },
						{
							get class() {
								return $.get($0);
							},

							get pathRef() {
								return $$props.ref;
							}
						}
					));
				});
			}

			$.append($$anchor, fragment_2);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}