import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="svelte-17o00mv"> </div>`);

export default function Inline_handlers_input($$anchor) {
	let m = { x: 0, y: 0 };

	function handleMousemove(event) {
		m.x = event.clientX;
		m.y = event.clientY;
	}

	var div = root();
	var text = $.only_child(div);

	$.template_effect(() => $.set_text(text, `The mouse position is ${m.x ?? ''} x ${m.y ?? ''}`));
	$.event('mousemove', div, (e) => m = { x: e.clientX, y: e.clientY });
	$.append($$anchor, div);
}