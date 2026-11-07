import * as $ from 'svelte/internal/server';
import clsx from "clsx";

export default function Menu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			size = "24",
			color = "currentColor",
			variation = "outline",
			ariaLabel = "bars 3",
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let viewBox = "0 0 24 24";
		let svgpath = "";
		let svgoutline = $.derived(() => `<path stroke="${color}" stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"></path> `);
		let svgsolid = $.derived(() => `<path fill="${color}" clip-rule="evenodd" fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"></path> `);

		$$renderer.push(`<svg${$.attributes(
			{
				xmlns: 'http://www.w3.org/2000/svg',
				role: 'button',
				tabindex: '0',
				width: size,
				height: size,
				class: $.clsx(clsx(className)),
				...restProps,
				'aria-label': ariaLabel,
				fill: 'none',
				viewBox,
				'stroke-width': '2'
			},
			void 0,
			void 0,
			void 0,
			3
		)}>${$.html(svgpath)}</svg>`);
	});
}