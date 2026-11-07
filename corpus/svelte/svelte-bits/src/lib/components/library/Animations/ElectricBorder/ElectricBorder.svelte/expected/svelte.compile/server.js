import * as $ from 'svelte/internal/server';

function hexToRgba(hex, alpha = 1) {
	if (!hex) return `rgba(0,0,0,${alpha})`;

	let h = hex.replace('#', '');

	if (h.length === 3) h = h.split('').map((c) => c + c).join('');

	const int = parseInt(h, 16);
	const r = int >> 16 & 255;
	const g = int >> 8 & 255;
	const b = int & 255;

	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function ElectricBorder($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			color = '#FF8A4C',
			speed = 1,
			chaos = 0.12,
			borderRadius = 24,
			class: className = '',
			style = ''
		} = $$props;

		let canvas;
		let container;

		$$renderer.push(`<div${$.attr_class(`relative overflow-visible isolate ${$.stringify(className)}`)}${$.attr_style(`--electric-border-color:${$.stringify(color)};border-radius:${$.stringify(borderRadius)}px;${$.stringify(style)}`)}><div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[2]"><canvas class="block"></canvas></div> <div class="absolute inset-0 rounded-[inherit] pointer-events-none z-0"><div class="absolute inset-0 rounded-[inherit] pointer-events-none"${$.attr_style(`border:2px solid ${$.stringify(hexToRgba(color, 0.6))};filter:blur(1px);`)}></div> <div class="absolute inset-0 rounded-[inherit] pointer-events-none"${$.attr_style(`border:2px solid ${$.stringify(color)};filter:blur(4px);`)}></div> <div class="absolute inset-0 rounded-[inherit] pointer-events-none -z-[1] scale-110 opacity-30"${$.attr_style(`filter:blur(32px);background:linear-gradient(-30deg, ${$.stringify(color)}, transparent, ${$.stringify(color)});`)}></div></div> <div class="relative rounded-[inherit] z-[1]">`);
		children?.($$renderer);
		$$renderer.push(`<!----></div></div>`);
	});
}