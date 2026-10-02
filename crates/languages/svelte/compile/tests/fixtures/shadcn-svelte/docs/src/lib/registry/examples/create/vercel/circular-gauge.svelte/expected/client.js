import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg aria-hidden="true" fill="none" height="16" width="16" stroke-width="2" viewBox="0 0 100 100" class="-rotate-90"><circle cx="50" cy="50" r="42.5" stroke-width="12" stroke-dashoffset="0" stroke-linecap="round" stroke-linejoin="round" class="opacity-20" stroke="currentColor"></circle><circle cx="50" cy="50" r="42.5" stroke-width="12" stroke-dashoffset="0" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" class="transition-all duration-300"></circle></svg>`);

export default function Circular_gauge($$anchor, $$props) {
	const normalizedPercentage = $.derived(() => Math.min(Math.max($$props.percentage, 0), 100));
	const circumference = $.derived(() => 2 * Math.PI * 42.5);
	const strokePercent = $.derived(() => $.get(normalizedPercentage) / 100 * $.get(circumference));
	var svg = root();
	var circle = $.child(svg);

	$.set_style(circle, `stroke-dasharray: ${$.get(circumference) ?? ''} ${$.get(circumference) ?? ''};`);

	var circle_1 = $.sibling(circle);

	$.reset(svg);
	$.template_effect(() => $.set_style(circle_1, `stroke-dasharray: ${$.get(strokePercent) ?? ''} ${$.get(circumference) ?? ''};`));
	$.append($$anchor, svg);
}