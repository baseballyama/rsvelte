import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cls } from '@layerstack/tailwind';
import MarkerWrapper from '../MarkerWrapper.svelte';
import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
import { createId } from '$lib/utils/createId.js';
import { LineState, lineMarkInfo } from './Line.shared.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'x1',
	'y1',
	'x2',
	'y2',
	'marker',
	'markerStart',
	'markerMid',
	'markerEnd'
]);

var root = $.from_svg(`<line></line>`);
var root_1 = $.from_svg(`<!><!><!><!>`, 1);
var root_2 = $.from_svg(`<line></line><!><!><!>`, 1);

export default function Line_svg($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let // Pull out props that collide with `<line>` SVG attribute names so
	// `{...rest}` spread doesn't override our explicit values.
	rest = $.rest_props($$props, rest_excludes);

	const c = new LineState(() => ({
		x1: $$props.x1,
		y1: $$props.y1,
		x2: $$props.x2,
		y2: $$props.y2,
		marker: $$props.marker,
		markerStart: $$props.markerStart,
		markerMid: $$props.markerMid,
		markerEnd: $$props.markerEnd,
		...rest
	}));

	const markerStartId = $.derived(() => $$props.markerStart || $$props.marker ? createId('marker-start', uid) : '');
	const markerMidId = $.derived(() => $$props.markerMid || $$props.marker ? createId('marker-mid', uid) : '');
	const markerEndId = $.derived(() => $$props.markerEnd || $$props.marker ? createId('marker-end', uid) : '');

	c.chartCtx.registerComponent({
		name: 'Line',
		kind: 'mark',
		markInfo: () => lineMarkInfo(
			{
				x1: $$props.x1,
				y1: $$props.y1,
				x2: $$props.x2,
				y2: $$props.y2,
				...rest
			},
			c.dataMode
		)
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => $$props.markerStart ?? $$props.marker);

				MarkerWrapper(node_1, {
					get id() {
						return $.get(markerStartId);
					},

					get marker() {
						return $.get($0);
					}
				});
			}

			var node_2 = $.sibling(node_1);

			{
				let $0 = $.derived(() => $$props.markerMid ?? $$props.marker);

				MarkerWrapper(node_2, {
					get id() {
						return $.get(markerMidId);
					},

					get marker() {
						return $.get($0);
					}
				});
			}

			var node_3 = $.sibling(node_2);

			{
				let $0 = $.derived(() => $$props.markerEnd ?? $$props.marker);

				MarkerWrapper(node_3, {
					get id() {
						return $.get(markerEndId);
					},

					get marker() {
						return $.get($0);
					}
				});
			}

			var node_4 = $.sibling(node_3);

			$.each(node_4, 17, () => c.resolvedItems, (item) => item.key, ($$anchor, item) => {
				const resolvedFill = $.derived(() => resolveColorProp($$props.fill, $.get(item).d, c.chartCtx.cScale));
				const resolvedStroke = $.derived(() => resolveColorProp($$props.stroke, $.get(item).d, c.chartCtx.cScale));
				const resolvedFillOpacity = $.derived(() => resolveStyleProp($$props.fillOpacity, $.get(item).d));
				const resolvedStrokeWidth = $.derived(() => resolveStyleProp($$props.strokeWidth, $.get(item).d));
				const resolvedOpacity = $.derived(() => resolveStyleProp($$props.opacity, $.get(item).d));
				const resolvedClass = $.derived(() => resolveStyleProp($$props.class, $.get(item).d));
				var line = root();

				$.attribute_effect(
					line,
					($0) => ({
						...rest,
						x1: $.get(item).x1,
						y1: $.get(item).y1,
						x2: $.get(item).x2,
						y2: $.get(item).y2,
						fill: $.get(resolvedFill),
						stroke: $.get(resolvedStroke),
						'fill-opacity': $.get(resolvedFillOpacity),
						'stroke-width': $.get(resolvedStrokeWidth),
						opacity: $.get(resolvedOpacity),
						'marker-start': $.get(markerStartId) ? `url(#${$.get(markerStartId)})` : undefined,
						'marker-mid': $.get(markerMidId) ? `url(#${$.get(markerMidId)})` : undefined,
						'marker-end': $.get(markerEndId) ? `url(#${$.get(markerEndId)})` : undefined,
						'stroke-dasharray': c.dashArrayAttr,
						class: $0
					}),
					[() => cls('lc-line', $.get(resolvedClass))]
				);

				$.append($$anchor, line);
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_2 = root_2();
			var line_1 = $.first_child(fragment_2);

			$.attribute_effect(
				line_1,
				($0) => ({
					...rest,
					x1: c.motionX1,
					y1: c.motionY1,
					x2: c.motionX2,
					y2: c.motionY2,
					fill: c.staticFill,
					stroke: c.staticStroke,
					'fill-opacity': c.staticFillOpacity,
					'stroke-width': c.staticStrokeWidth,
					opacity: c.staticOpacity,
					'marker-start': $.get(markerStartId) ? `url(#${$.get(markerStartId)})` : undefined,
					'marker-mid': $.get(markerMidId) ? `url(#${$.get(markerMidId)})` : undefined,
					'marker-end': $.get(markerEndId) ? `url(#${$.get(markerEndId)})` : undefined,
					'stroke-dasharray': c.dashArrayAttr,
					class: $0
				}),
				[() => cls('lc-line', c.staticClassName)]
			);

			var node_5 = $.sibling(line_1);

			{
				let $0 = $.derived(() => $$props.markerStart ?? $$props.marker);

				MarkerWrapper(node_5, {
					get id() {
						return $.get(markerStartId);
					},

					get marker() {
						return $.get($0);
					}
				});
			}

			var node_6 = $.sibling(node_5);

			{
				let $0 = $.derived(() => $$props.markerMid ?? $$props.marker);

				MarkerWrapper(node_6, {
					get id() {
						return $.get(markerMidId);
					},

					get marker() {
						return $.get($0);
					}
				});
			}

			var node_7 = $.sibling(node_6);

			{
				let $0 = $.derived(() => $$props.markerEnd ?? $$props.marker);

				MarkerWrapper(node_7, {
					get id() {
						return $.get(markerEndId);
					},

					get marker() {
						return $.get($0);
					}
				});
			}

			$.append($$anchor, fragment_2);
		};

		$.if(node, ($$render) => {
			if (c.dataMode) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}