import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path fill="none"></path></svg>`);

export default function Squiggle($$anchor, $$props) {
	const width = 26;
	const height = 26;
	const stroke = 6;
	const halfStroke = stroke / 2;
	let top = $.prop($$props, 'top', 3, false);
	var svg = root();

	$.set_style(svg, '--stroke: 6px');
	$.set_attribute(svg, 'viewBox', '0 0 26 26');

	var path = $.child(svg);

	$.set_attribute(path, 'd', 'M 3 0 C 3 26 26 0 23 32');
	$.set_attribute(path, 'stroke-width', stroke);
	$.reset(svg);
	$.template_effect(() => $.set_class(svg, 0, $.clsx(top() ? 'top' : 'bottom'), 'svelte-1skdm6z'));
	$.append($$anchor, svg);
}