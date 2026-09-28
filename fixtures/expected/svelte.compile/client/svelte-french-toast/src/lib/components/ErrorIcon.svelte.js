import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="svelte-1rqrtk7"></div>`);

export default function ErrorIcon($$anchor, $$props) {
	let primary = $.prop($$props, 'primary', 3, '#ff4b4b'),
		secondary = $.prop($$props, 'secondary', 3, '#fff');

	var div = root();
	let styles;

	$.template_effect(() => styles = $.set_style(div, '', styles, { '--primary': primary(), '--secondary': secondary() }));
	$.append($$anchor, div);
}