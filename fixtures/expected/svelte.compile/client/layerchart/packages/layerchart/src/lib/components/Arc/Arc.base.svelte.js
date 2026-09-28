import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cls } from '@layerstack/tailwind';
import { extractLayerProps } from '$lib/utils/attributes.js';
import { ArcState } from './Arc.shared.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Path',
	'ref',
	'trackRef',
	'stroke',
	'motion',
	'value',
	'initialValue',
	'domain',
	'range',
	'startAngle',
	'endAngle',
	'innerRadius',
	'outerRadius',
	'cornerRadius',
	'padAngle',
	'trackStartAngle',
	'trackEndAngle',
	'trackInnerRadius',
	'trackOuterRadius',
	'trackCornerRadius',
	'trackPadAngle',
	'offset',
	'data',
	'tooltip',
	'track',
	'onpointerenter',
	'onpointermove',
	'onpointerleave',
	'ontouchmove',
	'children',
	'class'
]);

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Arc_base($$anchor, $$props) {
	$.push($$props, true);

	let refProp = $.prop($$props, 'ref', 15),
		trackRefProp = $.prop($$props, 'trackRef', 15),
		// Override the `.lc-path` CSS stroke default so arcs don't get a visible outline
		stroke = $.prop($$props, 'stroke', 3, 'none'),
		// Arc-specific config — extracted out of `...restProps` so it doesn't
		// leak onto `<Path>`. `motion` in particular would otherwise make Path
		// also tween the path-string on top of the end-angle tween that
		// `ArcState` already drives, producing visibly wrong arcs.
		// Pointer / tooltip wiring
		track = $.prop($$props, 'track', 3, false),
		onpointerenter = $.prop($$props, 'onpointerenter', 3, () => {}),
		onpointermove = $.prop($$props, 'onpointermove', 3, () => {}),
		onpointerleave = $.prop($$props, 'onpointerleave', 3, () => {}),
		ontouchmove = $.prop($$props, 'ontouchmove', 3, () => {}),
		restProps = $.rest_props($$props, rest_excludes);

	const c = new ArcState(() => ({
		motion: $$props.motion,
		value: $$props.value,
		initialValue: $$props.initialValue,
		domain: $$props.domain,
		range: $$props.range,
		startAngle: $$props.startAngle,
		endAngle: $$props.endAngle,
		innerRadius: $$props.innerRadius,
		outerRadius: $$props.outerRadius,
		cornerRadius: $$props.cornerRadius,
		padAngle: $$props.padAngle,
		trackStartAngle: $$props.trackStartAngle,
		trackEndAngle: $$props.trackEndAngle,
		trackInnerRadius: $$props.trackInnerRadius,
		trackOuterRadius: $$props.trackOuterRadius,
		trackCornerRadius: $$props.trackCornerRadius,
		trackPadAngle: $$props.trackPadAngle,
		offset: $$props.offset
	}));

	let ref = $.state(void 0);

	$.user_pre_effect(() => {
		refProp($.get(ref));
	});

	$.user_pre_effect(() => {
		trackRefProp(c.trackRef);
	});

	const onPointerEnter = (e) => {
		onpointerenter()?.(e);

		if ($$props.tooltip) c.ctx.tooltip.show(e, $$props.data);
	};

	const onPointerMove = (e) => {
		onpointermove()?.(e);

		if ($$props.tooltip) c.ctx.tooltip.show(e, $$props.data);
	};

	const onPointerLeave = (e) => {
		onpointerleave()?.(e);

		if ($$props.tooltip) c.ctx.tooltip.hide();
	};

	var fragment = root();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);
			var bind_get = () => c.trackRef;
			var bind_set = (v) => c.trackRef = v;

			{
				let $0 = $.derived(() => c.trackArc());
				let $1 = $.derived(() => extractLayerProps(track(), 'lc-arc-track'));

				$.component(node_1, () => $$props.Path, ($$anchor, Path_1) => {
					Path_1($$anchor, $.spread_props(
						{
							get pathData() {
								return $.get($0);
							},
							stroke: 'none',
							get pathRef() {
								return bind_get();
							},

							set pathRef($$value) {
								bind_set($$value);
							}
						},
						() => $.get($1)
					));
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (track()) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => c.arc());
		let $1 = $.derived(() => cls('lc-arc-line', $$props.class));

		$.component(node_2, () => $$props.Path, ($$anchor, Path_2) => {
			Path_2($$anchor, $.spread_props(
				{
					get pathData() {
						return $.get($0);
					},

					get transform() {
						return `translate(${c.xOffset ?? ''}, ${c.yOffset ?? ''})`;
					},

					get stroke() {
						return stroke();
					}
				},
				() => restProps,
				{
					get class() {
						return $.get($1);
					},
					onpointerenter: onPointerEnter,
					onpointermove: onPointerMove,
					onpointerleave: onPointerLeave,
					ontouchmove: (e) => {
						ontouchmove()?.(e);

						if ($$props.tooltip) {
							e.preventDefault();
						}
					},

					get pathRef() {
						return $.get(ref);
					},

					set pathRef($$value) {
						$.set(ref, $$value, true);
					}
				}
			));
		});
	}

	var node_3 = $.sibling(node_2, 2);

	$.snippet(node_3, () => $$props.children ?? $.noop, () => ({
		centroid: c.trackArcCentroid,
		boundingBox: c.boundingBox,
		value: c.motionEndAngleValue,
		startAngle: c.startAngle,
		endAngle: c.arcEndAngle,
		innerRadius: c.innerRadius,
		outerRadius: c.outerRadius,
		getTrackTextProps: c.getTrackTextProps,
		getArcTextProps: c.getArcTextProps
	}));

	$.append($$anchor, fragment);
	$.pop();
}