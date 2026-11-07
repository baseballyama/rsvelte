import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><g fill="currentColor" stroke-width="2.5" stroke="currentColor" transform-origin="center"><path d="M 12 8 l -4 7"></path><path d="M 12 8 l 4 7"></path></g></svg>`);

export default function AndOrIcon($$anchor, $$props) {
	let mode = $.prop($$props, 'mode', 3, 'and');
	var svg = root();
	var g = $.child(svg);
	let styles;

	$.reset(svg);
	$.template_effect(() => styles = $.set_style(g, 'transform-box: fill-box', styles, { rotate: mode() === 'or' ? '180deg' : '0deg' }));
	$.append($$anchor, svg);
}