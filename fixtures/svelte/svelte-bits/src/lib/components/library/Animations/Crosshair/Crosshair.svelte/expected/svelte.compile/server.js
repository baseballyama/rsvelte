import * as $ from 'svelte/internal/server';
import { gsap } from 'gsap';

export default function Crosshair($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { color = 'white', containerRef: container = null } = $$props;
		let lineH;
		let lineV;
		let filterX;
		let filterY;

		$$renderer.push(`<div${$.attr_class(`${container ? 'absolute' : 'fixed'} top-0 left-0 w-full h-full pointer-events-none z-[10000]`)}><svg class="absolute top-0 left-0 w-full h-full" aria-hidden="true"><defs><filter id="filter-noise-x"><feTurbulence type="fractalNoise" baseFrequency="0.000001" numOctaves="1"></feTurbulence><feDisplacementMap in="SourceGraphic" scale="40"></feDisplacementMap></filter><filter id="filter-noise-y"><feTurbulence type="fractalNoise" baseFrequency="0.000001" numOctaves="1"></feTurbulence><feDisplacementMap in="SourceGraphic" scale="40"></feDisplacementMap></filter></defs></svg> <div class="absolute w-full pointer-events-none opacity-0 transform translate-y-1/2"${$.attr_style(`height:1px;background:${$.stringify(color)};`)}></div> <div class="absolute h-full pointer-events-none opacity-0 transform translate-x-1/2"${$.attr_style(`width:1px;background:${$.stringify(color)};`)}></div></div>`);
	});
}