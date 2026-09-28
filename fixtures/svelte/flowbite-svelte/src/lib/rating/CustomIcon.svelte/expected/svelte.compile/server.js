import * as $ from 'svelte/internal/server';
import clsx from "clsx";

export default function CustomIcon($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			fillPercent = 100,
			fillColor = "#00ff00",
			strokeColor = "#00ff00",
			size = 24,
			ariaLabel = "custom icon",
			iconIndex = 0,
			groupId = "custom",
			role = "img",
			svgClass,
			pathd = "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const uniqueId = $.derived(() => `${groupId}-${iconIndex}`);

		$$renderer.push(`<svg${$.attributes(
			{
				width: size,
				height: size,
				class: $.clsx(clsx(svgClass)),
				...restProps,
				'aria-label': ariaLabel,
				viewBox: '0 0 24 24',
				role,
				'stroke-width': '1.5'
			},
			void 0,
			void 0,
			void 0,
			3
		)}><defs><linearGradient${$.attr('id', uniqueId())} x1="0%" y1="0%" x2="100%" y2="0%">`);

		if (fillPercent !== 100) {
			$$renderer.push(`<!--[0--><stop offset="0%"${$.attr('stop-color', fillColor)}></stop><stop${$.attr('offset', `${$.stringify(fillPercent)}%`)}${$.attr('stop-color', fillColor)}></stop><stop${$.attr('offset', `${$.stringify(fillPercent)}%`)} stop-color="transparent"></stop><stop offset="100%" stop-color="transparent"></stop>`);
		} else {
			$$renderer.push(`<!--[-1--><stop offset="0%"${$.attr('stop-color', fillColor)}></stop><stop offset="100%"${$.attr('stop-color', fillColor)}></stop>`);
		}

		$$renderer.push(`<!--]--></linearGradient></defs><path${$.attr('d', pathd)}${$.attr('fill', `url(#${uniqueId()})`)}${$.attr('stroke', strokeColor)} stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
	});
}