import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="svelte-1m8xkuk"> </div>`);

export default function Inline_handlers_output($$anchor) {
	let m = { x: 0, y: 0 };
	var div = root();
	var text = $.only_child(div);

	$.template_effect(() => $.set_text(text, `The mouse position is ${m.x ?? ''} x ${m.y ?? ''}`));
	$.event('mousemove', div, (e) => m = { x: e.clientX, y: e.clientY });
	$.append($$anchor, div);
}