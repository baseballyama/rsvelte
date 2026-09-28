import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'color',
	'size',
	'strokeWidth',
	'absoluteStrokeWidth',
	'class'
]);

var root = $.from_svg(`<svg><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path><circle cx="12" cy="12" r="3"></circle></svg>`);

export default function Logo($$anchor, $$props) {
	$.push($$props, true);

	// Supported props type definition
	let color = $.prop($$props, 'color', 3, 'currentColor'),
		size = $.prop($$props, 'size', 3, 24),
		strokeWidth = $.prop($$props, 'strokeWidth', 3, 2),
		absoluteStrokeWidth = $.prop($$props, 'absoluteStrokeWidth', 3, false),
		className = $.prop($$props, 'class', 3, ''),
		rest = $.rest_props($$props, rest_excludes);

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

	var svg = root();

	$.attribute_effect(
		svg,
		($0, $1) => ({
			...defaultAttributes,
			width: size(),
			height: size(),
			stroke: color(),
			'stroke-width': $0,
			class: $1,
			...rest
		}),
		[
			() => absoluteStrokeWidth()
				? Number(strokeWidth()) * 24 / Number(size())
				: strokeWidth(),
			() => mergeClasses('lucide-icon', 'lucide', 'lucide-eye', className())
		]
	);

	$.append($$anchor, svg);
	$.pop();
}