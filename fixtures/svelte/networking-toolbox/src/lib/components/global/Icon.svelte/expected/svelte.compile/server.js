import * as $ from 'svelte/internal/server';
import { iconMap } from '$lib/constants/icon-map';

export default function Icon($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { name, size = 'md', animate = null, rotate = 0 } = $$props;

		const sizeClasses = {
			xs: 'w-2 h-2',
			sm: 'w-4 h-4',
			md: 'w-6 h-6',
			lg: 'w-8 h-8',
			xl: 'w-10 h-10'
		};

		/**
		 * Get SVG content for the given icon name
		 * @param iconName - The name of the icon to retrieve
		 * @returns The SVG content string or undefined if not found
		 */
		function getSvgContent(iconName) {
			const icon = iconMap[iconName];

			if (!icon) {
				console.warn(`Icon "${iconName}" not found. Using default icon.`);
			}

			return icon;
		}

		// Get the SVG content for the current icon (reactive to name changes)
		const svgContent = $.derived(() => getSvgContent(name));

		$$renderer.push(`<div${$.attr_class(`icon ${$.stringify(sizeClasses[size])} ${animate ? `animate-${animate}` : ''} ${rotate ? `rotate rotate-${rotate}` : ''} `, 'svelte-1q906rh')}>`);

		if (svgContent()) {
			$$renderer.push(`<!--[0-->${$.html(svgContent())}`);
		} else {
			$$renderer.push(`<!--[-1--><svg fill="currentColor" viewBox="0 0 24 24" class="svelte-1q906rh"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" class="svelte-1q906rh"></path></svg>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}