import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="svelte-1s5buy2"></div>`);

export default function LoaderIcon($$anchor, $$props) {
	let primary = $.prop($$props, 'primary', 3, '#616161'),
		secondary = $.prop($$props, 'secondary', 3, '#e0e0e0');

	var div = root();
	let styles;

	$.template_effect(() => styles = $.set_style(div, '', styles, { '--primary': primary(), '--secondary': secondary() }));
	$.append($$anchor, div);
}