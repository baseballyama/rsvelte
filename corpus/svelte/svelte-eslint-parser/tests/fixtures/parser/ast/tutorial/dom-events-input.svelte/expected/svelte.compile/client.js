import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="svelte-xw72cm"> </div>`);

export default function Dom_events_input($$anchor) {
	let m = { x: 0, y: 0 };

	function handleMousemove(event) {
		m.x = event.clientX;
		m.y = event.clientY;
	}

	var div = root();
	var text = $.only_child(div);

	$.template_effect(() => $.set_text(text, `The mouse position is ${m.x ?? ''} x ${m.y ?? ''}`));
	$.event('mousemove', div, handleMousemove);
	$.append($$anchor, div);
}