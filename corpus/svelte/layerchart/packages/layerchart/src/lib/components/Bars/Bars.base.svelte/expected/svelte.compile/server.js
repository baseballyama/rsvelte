import * as $ from 'svelte/internal/server';
import { extractLayerProps } from '$lib/utils/attributes.js';
import { BarsState } from './Bars.shared.svelte.js';

export default function Bars_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			Bar,
			Group,
			fill,
			key = (_, i) => i,
			data: dataProp,
			onBarClick = () => {},
			children,
			radius = 0,
			strokeWidth = 0,
			stroke = 'black',
			seriesKey,
			stackPadding = 0,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const c = new BarsState(() => ({
			data: dataProp,
			key,
			onBarClick,
			seriesKey,
			stackPadding,
			fill,
			radius,
			strokeWidth,
			stroke
		}));

		if (Group) {
			$$renderer.push('<!--[-->');

			Group($$renderer, {
				class: 'lc-bars',
				children: ($$renderer) => {
					if (children) {
						$$renderer.push('<!--[0-->');
						children($$renderer);
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push(`<!--[-1--><!--[-->`);

						const each_array = $.ensure_array_like(c.data);

						for (let i = 0, $$length = each_array.length; i < $$length; i++) {
							let d = each_array[i];

							if (Bar) {
								$$renderer.push('<!--[-->');

								Bar($$renderer, $.spread_props([
									{
										data: d,
										radius,
										strokeWidth,
										stroke,
										seriesKey,
										stackPadding,
										fill: fill ?? c.series?.color ?? (c.ctx.config.c ? c.ctx.cGet(d) : null),
										onclick: (e) => onBarClick(e, { data: d })
									},
									extractLayerProps(restProps, 'lc-bars-bar')
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
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}