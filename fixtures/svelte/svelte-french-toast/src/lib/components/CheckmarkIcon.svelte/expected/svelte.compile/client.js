import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="svelte-1fonl50"></div>`);

export default function CheckmarkIcon($$anchor, $$props) {
	let primary = $.prop($$props, 'primary', 3, '#61d345'),
		secondary = $.prop($$props, 'secondary', 3, '#fff');

	var div = root();
	let styles;

	$.template_effect(() => styles = $.set_style(div, '', styles, { '--primary': primary(), '--secondary': secondary() }));
	$.append($$anchor, div);
}