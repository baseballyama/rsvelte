import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> </div>`);

export default function $props_input($$anchor, $$props) {
	var div = root();
	var text = $.only_child(div, true);

	$.template_effect(() => $.set_text(text, $$props.x));
	$.append($$anchor, div);
}