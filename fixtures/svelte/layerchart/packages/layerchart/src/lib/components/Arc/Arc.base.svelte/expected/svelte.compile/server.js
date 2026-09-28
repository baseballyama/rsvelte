import * as $ from 'svelte/internal/server';
import { cls } from '@layerstack/tailwind';
import { extractLayerProps } from '$lib/utils/attributes.js';
import { ArcState } from './Arc.shared.svelte.js';

export default function Arc_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			Path,
			ref: refProp = void 0,
			trackRef: trackRefProp = void 0,
			// Override the `.lc-path` CSS stroke default so arcs don't get a visible outline
			stroke = 'none',

			// Arc-specific config — extracted out of `...restProps` so it doesn't
			// leak onto `<Path>`. `motion` in particular would otherwise make Path
			// also tween the path-string on top of the end-angle tween that
			// `ArcState` already drives, producing visibly wrong arcs.
			motion,
			value,
			initialValue,
			domain,
			range,
			startAngle,
			endAngle,
			innerRadius,
			outerRadius,
			cornerRadius,
			padAngle,
			trackStartAngle,
			trackEndAngle,
			trackInnerRadius,
			trackOuterRadius,
			trackCornerRadius,
			trackPadAngle,
			offset,
			// Pointer / tooltip wiring
			data,
			tooltip,
			track = false,
			onpointerenter = () => {},
			onpointermove = () => {},
			onpointerleave = () => {},
			ontouchmove = () => {},
			children,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const c = new ArcState(() => ({
			motion,
			value,
			initialValue,
			domain,
			range,
			startAngle,
			endAngle,
			innerRadius,
			outerRadius,
			cornerRadius,
			padAngle,
			trackStartAngle,
			trackEndAngle,
			trackInnerRadius,
			trackOuterRadius,
			trackCornerRadius,
			trackPadAngle,
			offset
		}));

		let ref = void 0;

		const onPointerEnter = (e) => {
			onpointerenter?.(e);

			if (tooltip) c.ctx.tooltip.show(e, data);
		};

		const onPointerMove = (e) => {
			onpointermove?.(e);

			if (tooltip) c.ctx.tooltip.show(e, data);
		};

		const onPointerLeave = (e) => {
			onpointerleave?.(e);

			if (tooltip) c.ctx.tooltip.hide();
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (track) {
				$$renderer.push('<!--[0-->');

				var bind_get = () => c.trackRef;
				var bind_set = (v) => c.trackRef = v;

				if (Path) {
					$$renderer.push('<!--[-->');

					Path($$renderer, $.spread_props([
						{
							pathData: c.trackArc(),
							stroke: 'none',
							get pathRef() {
								return bind_get();
							},

							set pathRef($$value) {
								bind_set($$value);
							}
						},
						extractLayerProps(track, 'lc-arc-track')
					]));

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (Path) {
				$$renderer.push('<!--[-->');

				Path($$renderer, $.spread_props([
					{
						pathData: c.arc(),
						transform: `translate(${$.stringify(c.xOffset)}, ${$.stringify(c.yOffset)})`,
						stroke
					},
					restProps,
					{
						class: cls('lc-arc-line', className),
						onpointerenter: onPointerEnter,
						onpointermove: onPointerMove,
						onpointerleave: onPointerLeave,
						ontouchmove: (e) => {
							ontouchmove?.(e);

							if (tooltip) {
								e.preventDefault();
							}
						},

						get pathRef() {
							return ref;
						},

						set pathRef($$value) {
							ref = $$value;
							$$settled = false;
						}
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			children?.($$renderer, {
				centroid: c.trackArcCentroid,
				boundingBox: c.boundingBox,
				value: c.motionEndAngleValue,
				startAngle: c.startAngle,
				endAngle: c.arcEndAngle,
				innerRadius: c.innerRadius,
				outerRadius: c.outerRadius,
				getTrackTextProps: c.getTrackTextProps,
				getArcTextProps: c.getArcTextProps
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref: refProp, trackRef: trackRefProp });
	});
}