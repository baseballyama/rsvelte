import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>`);

export default function Moon($$anchor, $$props) {
	let className = $.prop($$props, 'class', 3, "");
	var svg = root();

	$.template_effect(() => $.set_class(svg, 0, $.clsx(className())));
	$.append($$anchor, svg);
}