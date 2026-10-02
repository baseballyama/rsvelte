import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleLinear } from 'd3-scale';
import { geoDistance } from 'd3-geo';
import { getGeoContext } from '$lib/contexts/geo.js';
import { extractLayerProps } from '$lib/utils/attributes.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Group',
	'link',
	'ref',
	'children',
	'opacity'
]);

export default function GeoEdgeFade_base($$anchor, $$props) {
	$.push($$props, true);

	let refProp = $.prop($$props, 'ref', 15),
		restProps = $.rest_props($$props, rest_excludes);

	let ref = $.state(void 0);

	$.user_pre_effect(() => {
		refProp($.get(ref));
	});

	const geo = getGeoContext();
	const fade = scaleLinear().domain([-0.1, 0]).range([0, 0.1]);
	const clamper = scaleLinear().domain([0, 1]).range([0, 1]).clamp(true);
	const center = $.derived(() => geo.projection?.invert?.(geo.projection?.translate()) ?? [0, 0]);
	const source = $.derived(() => $$props.link.source);
	const target = $.derived(() => $$props.link.target);
	const startDistance = $.derived(() => 1.57 - geoDistance($.get(source), $.get(center)));
	const endDistance = $.derived(() => 1.57 - geoDistance($.get(target), $.get(center)));
	const distance = $.derived(() => $.get(startDistance) < $.get(endDistance) ? $.get(startDistance) : $.get(endDistance));
	const opacity = $.derived(() => $$props.opacity ?? clamper(fade($.get(distance))));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => extractLayerProps(restProps, 'lc-geo-edge-fade'));

		$.component(node, () => $$props.Group, ($$anchor, Group_1) => {
			Group_1($$anchor, $.spread_props(
				{
					get opacity() {
						return $.get(opacity);
					}
				},
				() => $.get($0),
				{
					get ref() {
						return $.get(ref);
					},

					set ref($$value) {
						$.set(ref, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_1 = $.first_child(fragment_1);

						$.snippet(node_1, () => $$props.children ?? $.noop);
						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}