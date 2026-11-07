import * as $ from 'svelte/internal/server';
import Facet from '../Facet.svelte';
import { getChartContext } from '$lib/contexts/chart.js';
import { setLayerContext } from '$lib/contexts/layer.js';

export default function Svg($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref: refProp = void 0,
			innerRef: innerRefProp = void 0,
			zIndex = 0,
			pointerEvents,
			viewBox,
			ignoreTransform = false,
			center = false,
			clip = false,
			class: className,
			title,
			defs,
			children: childrenProp,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let ref = void 0;
		let innerRef = void 0;
		const ctx = getChartContext();

		const transform = $.derived(() => {
			if (ctx.transform.mode === 'canvas' && !ignoreTransform) {
				return `translate(${ctx.transform.translate.x},${ctx.transform.translate.y}) scale(${ctx.transform.scale})`;
			} else if (center) {
				return `translate(${center === 'x' || center === true ? ctx.width / 2 : 0}, ${center === 'y' || center === true ? ctx.height / 2 : 0})`;
			}
		});

		setLayerContext('svg');

		$$renderer.push(`<svg${$.attributes(
			{
				viewBox,
				width: ctx.containerWidth,
				height: ctx.containerHeight,
				class: $.clsx(['lc-layout-svg', className]),
				role: 'figure',
				...restProps
			},
			'svelte-1phxlxb',
			{ disablePointerEvents: pointerEvents === false, clip },
			{ 'z-index': zIndex },
			3
		)}>`);

		if (typeof title === 'function') {
			$$renderer.push('<!--[0-->');
			title($$renderer);
			$$renderer.push(`<!---->`);
		} else if (title) {
			$$renderer.push(`<!--[1--><title class="lc-layout-svg-title">${$.escape(title)}</title>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--><defs>`);
		defs?.($$renderer);
		$$renderer.push(`<!----></defs><g class="lc-layout-svg-g"${$.attr('transform', `translate(${$.stringify(ctx.padding.left)}, ${$.stringify(ctx.padding.top)})`)}>`);

		if (transform()) {
			$$renderer.push(`<!--[0--><g${$.attr('transform', transform())} class="lc-layout-svg-g-transform">`);

			{
				function children($$renderer, { facet }) {
					childrenProp?.($$renderer, { ref, facet });
					$$renderer.push(`<!---->`);
				}

				Facet($$renderer, { children, $$slots: { default: true } });
			}

			$$renderer.push(`<!----></g>`);
		} else {
			$$renderer.push('<!--[-1-->');

			{
				function children($$renderer, { facet }) {
					childrenProp?.($$renderer, { ref, facet });
					$$renderer.push(`<!---->`);
				}

				Facet($$renderer, { children, $$slots: { default: true } });
			}
		}

		$$renderer.push(`<!--]--></g></svg>`);
		$.bind_props($$props, { ref: refProp, innerRef: innerRefProp });
	});
}