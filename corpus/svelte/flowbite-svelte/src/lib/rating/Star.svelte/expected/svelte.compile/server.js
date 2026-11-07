import * as $ from 'svelte/internal/server';
import clsx from "clsx";

export default function Star($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			fillPercent = 100,
			fillColor = "#F5CA14",
			strokeColor = "#F5CA14",
			size = 24,
			ariaLabel = "star",
			iconIndex = 0,
			groupId = "star",
			role = "img",
			svgClass,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const uniqueId = $.derived(() => `${groupId}-${iconIndex}`);

		$$renderer.push(`<svg${$.attributes(
			{
				width: size,
				height: size,
				...restProps,
				class: $.clsx(clsx(svgClass)),
				'aria-label': ariaLabel,
				viewBox: '100 100 120 120',
				role
			},
			void 0,
			void 0,
			void 0,
			3
		)}><defs><linearGradient${$.attr('id', uniqueId())}>`);

		if (fillPercent !== 100) {
			$$renderer.push(`<!--[0--><stop offset="0%"${$.attr('stop-color', fillColor)}></stop><stop${$.attr('offset', `${$.stringify(fillPercent)}%`)}${$.attr('stop-color', fillColor)}></stop><stop${$.attr('offset', `${$.stringify(fillPercent)}%`)} stop-color="transparent"></stop><stop offset="100%" stop-color="transparent"></stop>`);
		} else {
			$$renderer.push(`<!--[-1--><stop offset="0%"${$.attr('stop-color', fillColor)}></stop><stop offset="100%"${$.attr('stop-color', fillColor)}></stop>`);
		}

		$$renderer.push(`<!--]--></linearGradient></defs><g${$.attr('fill', `url(#${uniqueId()})`)}${$.attr('stroke', strokeColor)} stroke-width="2"><polygon points="165.000, 185.000, 188.511, 197.361, 184.021, 171.180, 
      203.042, 152.639, 176.756, 148.820, 165.000, 125.000, 
      153.244, 148.820, 126.958, 152.639, 145.979, 171.180,
      141.489, 197.361, 165.000, 185.000"></polygon></g></svg>`);
	});
}