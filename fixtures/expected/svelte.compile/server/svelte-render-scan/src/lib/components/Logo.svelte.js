import * as $ from 'svelte/internal/server';

export default function Logo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Supported props type definition
		let {
			color = 'currentColor',
			size = 24,
			strokeWidth = 2,
			absoluteStrokeWidth = false,
			class: className = '',
			$$slots,
			$$events,
			...rest
		} = $$props;

		// Helper to merge classes just like the original Icon component
		function mergeClasses(...classes) {
			return classes.filter(Boolean).join(' ');
		}

		// Default SVG attributes
		const defaultAttributes = {
			xmlns: 'http://www.w3.org/2000/svg',
			width: 24,
			height: 24,
			viewBox: '0 0 24 24',
			fill: 'none',
			stroke: 'currentColor',
			'stroke-width': 2,
			'stroke-linecap': 'round',
			'stroke-linejoin': 'round'
		};

		$$renderer.push(`<svg${$.attributes(
			{
				...defaultAttributes,
				width: size,
				height: size,
				stroke: color,
				'stroke-width': absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
				class: $.clsx(mergeClasses('lucide-icon', 'lucide', 'lucide-eye', className)),
				...rest
			},
			void 0,
			void 0,
			void 0,
			3
		)}><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path><circle cx="12" cy="12" r="3"></circle></svg>`);
	});
}