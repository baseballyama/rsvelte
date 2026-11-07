import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { iconMap } from '$lib/constants/icon-map';

var root = $.from_svg(`<svg fill="currentColor" viewBox="0 0 24 24" class="svelte-1q906rh"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" class="svelte-1q906rh"></path></svg>`);
var root_1 = $.from_html(`<div><!></div>`);

export default function Icon($$anchor, $$props) {
	$.push($$props, true);

	let size = $.prop($$props, 'size', 3, 'md'),
		animate = $.prop($$props, 'animate', 3, null),
		rotate = $.prop($$props, 'rotate', 3, 0);

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
	const svgContent = $.derived(() => getSvgContent($$props.name));

	var div = root_1();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.html(node_1, () => $.get(svgContent));
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var svg = root();

			$.append($$anchor, svg);
		};

		$.if(node, ($$render) => {
			if ($.get(svgContent)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.template_effect(() => $.set_class(div, 1, `icon ${sizeClasses[size()] ?? ''} ${animate() ? `animate-${animate()}` : ''} ${rotate() ? `rotate rotate-${rotate()}` : ''} `, 'svelte-1q906rh'));
	$.append($$anchor, div);
	$.pop();
}